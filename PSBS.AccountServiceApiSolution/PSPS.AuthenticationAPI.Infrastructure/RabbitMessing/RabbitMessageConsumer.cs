
using Polly.CircuitBreaker;
using Polly;
using PSPS.AccountAPI.Application.Interfaces;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Net.Sockets;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.ComponentModel;
using RabbitMQ.Client.Events;
using System.Text;
using Newtonsoft.Json;
using PSPS.AccountAPI.Application.DTOs;

namespace PSPS.AccountAPI.Infrastructure.RabbitMessing
{
   public class RabbitMessageConsumer
    {
        private IConnection _connection;
        private IModel _channel;
        private readonly IEmail _emailRepository;
        private readonly IAccount _accountRepository;
        public bool IsRabbitAvailable { get; set; } = false;
        private static readonly CircuitBreakerPolicy _circuitBreaker = Policy
         .Handle<BrokerUnreachableException>()
         .Or<SocketException>()
         .CircuitBreaker(
             exceptionsAllowedBeforeBreaking: 3,
             durationOfBreak: TimeSpan.FromMinutes(1)
         );
        private readonly TimeSpan _reconnectDelay = TimeSpan.FromSeconds(60);
        private DateTime _lastConnectionAttempt = DateTime.MinValue;

        public RabbitMessageConsumer(IEmail emailRepository, IAccount accountRepository)
        {
            _emailRepository = emailRepository;
            TryInitializeRabbitMQWithRetry();
            _accountRepository = accountRepository;
        }

        private void TryInitializeRabbitMQWithRetry()
        {
            // Don't attempt if we recently tried
            if (DateTime.UtcNow - _lastConnectionAttempt < _reconnectDelay && !IsRabbitAvailable)
                return;

            _lastConnectionAttempt = DateTime.UtcNow;

            if (_circuitBreaker.CircuitState == CircuitState.Open)
            {
                LogExceptions.LogToDebugger("⚠️ Circuit breaker is open - skipping RabbitMQ connection attempt");
                IsRabbitAvailable = false;
                return;
            }

            try
            {
                _circuitBreaker.Execute(() =>
                {
                    // Close existing connection if present
                    _channel?.Close();
                    _connection?.Close();

                    var factory = new ConnectionFactory
                    {
                        Uri = new Uri("amqp://guest:guest@localhost:5672"),
                        ClientProvidedName = "Rabbit Receive App",
                        AutomaticRecoveryEnabled = true,
                        NetworkRecoveryInterval = TimeSpan.FromSeconds(30),  // Longer recovery interval
                        RequestedHeartbeat = TimeSpan.FromSeconds(30),       // Explicit heartbeat
                        ContinuationTimeout = TimeSpan.FromSeconds(20),      // Operation timeout
                        DispatchConsumersAsync = true                        // Async consumer mode
                    };

                    _connection = factory.CreateConnection();
                    _channel = _connection.CreateModel();

                    string exchangeName = "NotificationExchange";
                    string routingKey = "notification-email-key";
                    string queueName = "send-notification-email";

                    // Declare the exchange and queue, and bind them
                    _channel.ExchangeDeclare(exchangeName, ExchangeType.Direct);
                    _channel.QueueDeclare(queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
                    _channel.QueueBind(queueName, exchangeName, routingKey, null);

                    // Setup connection events
                    _connection.ConnectionShutdown += (sender, args) =>
                    {
                        IsRabbitAvailable = false;
                        LogExceptions.LogToDebugger($"⚠️ RabbitMQ connection shut down: {args.ReplyText}");
                    };

                    _connection.ConnectionBlocked += (sender, args) =>
                    {
                        LogExceptions.LogToDebugger($"⚠️ RabbitMQ connection blocked: {args.Reason}");
                    };

                    _connection.ConnectionUnblocked += (sender, args) =>
                    {
                        IsRabbitAvailable = true;
                        LogExceptions.LogToDebugger("✅ RabbitMQ connection unblocked");
                    };

                    IsRabbitAvailable = true;
                    LogExceptions.LogToDebugger("✅ RabbitMQ connection established");
                });
            }
            catch (Exception ex)
            {
                IsRabbitAvailable = false;
                LogExceptions.LogToDebugger($"⚠️ RabbitMQ connection failed: {ex.Message}");
            }
        }

        public async Task<Response> SendNotificationEmailConsumer()
        {
            if (!IsRabbitAvailable)
            {
                TryInitializeRabbitMQWithRetry();

                return new Response
                {
                    Flag = false,
                    Message = "RabbitMQ is not available. Messages will not be processed."
                };
            }

            try
            {
                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.Received += async (sender, args) =>
                {
                    try
                    {
                        var body = args.Body.ToArray();
                        string message = Encoding.UTF8.GetString(body);
                        LogExceptions.LogToDebugger("New message received: " + message);
                        var result = await ProcessNotificationMessage(message);

                        if (result.Flag)
                        {
                            _channel.BasicAck(args.DeliveryTag, false);
                        }
                        else
                        {
                            _channel.BasicNack(args.DeliveryTag, false, true);
                        }
                    }
                    catch (Exception ex)
                    {
                        LogExceptions.LogToDebugger($"Error processing message: {ex.Message}");
                        _channel.BasicNack(args.DeliveryTag, false, true);
                    }
                    await Task.Yield();
                };

                _channel.BasicConsume(
                    queue: "send-notification-email",
                    autoAck:false,
                    consumer:consumer);
                return new Response { Flag = true, Message = "Consumer started" };
            }
            catch (Exception ex)
            {
                IsRabbitAvailable = false;
                LogExceptions.LogToDebugger($"⚠️ RabbitMQ consumption error: {ex.Message}");
                return new Response { Flag = false, Message = $"Failed to start consumer: {ex.Message}" };
            }
        }

        private async Task<Response> ProcessNotificationMessage(string message)
        {
            try
            {
                var notification = JsonConvert.DeserializeObject<SendNotificationDTO>(message);
                if (notification != null)
                {
                    var content = new NotificationMessage { NotificationTitle = notification.NotificationTitle, NotificationContent = notification.NotificationContent };
                    foreach (var receiver in notification.Receivers)
                    {
                        try
                        {
                            var account = await _accountRepository.GetByIdAsync(receiver.UserId);
                            if (account is null)
                            {
                                LogExceptions.LogToDebugger($"Error processing receiver: {receiver.UserId}");
                                return new Response { Flag = false, Message = $"Error processing receiver: {receiver.UserId}" };
                            }
                            else
                            {
                                // Process each receiver
                             await _emailRepository.SendNotificationEmail(account, content);
                            
                            }
                             
                        }
                        catch (Exception ex)
                        {
                            LogExceptions.LogToDebugger($"Error processing receiver: {ex.Message}");
                            return new Response { Flag = false, Message = $"Error processing receiver: {ex.Message}" };
                        }
                    }
                    return new Response { Flag = true, Message = "All receivers processed successfully." };
                }
                else
                {
                    LogExceptions.LogToDebugger("Failed to deserialize message to SendNotificationDTO.");
                    return new Response { Flag = false, Message = "Failed to deserialize message to SendNotificationDTO." };
                }
            }
            catch (JsonException ex)
            {
                LogExceptions.LogToDebugger($"Error deserializing JSON: {ex.Message}");
                return new Response { Flag = false, Message = "Failed to deserialize message to SendNotificationDTO." };
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"Error processing message: {ex.Message}");
                return new Response { Flag = false, Message = $"Error processing message: {ex.Message}" };
            }
        }
    }
}
