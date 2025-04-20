using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using ChatServiceApi.Infrastructure.Repositories;
using Newtonsoft.Json;
using Polly;
using Polly.CircuitBreaker;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RabbitMQ.Client.Exceptions;
using System.Net.Sockets;
using System.Text;

namespace ChatServiceApi.Infrastructure.RabbitMessaging
{
    public class RabbitMessageConsumer : IDisposable
    {
        private IConnection _connection;
        private IModel _channel;
        private readonly INoticationRepository _notificationRepository;
        public bool IsRabbitAvailable { get;  set; } = false;

        private static readonly CircuitBreakerPolicy _circuitBreaker = Policy
            .Handle<BrokerUnreachableException>()
            .Or<SocketException>()
            .CircuitBreaker(
                exceptionsAllowedBeforeBreaking: 3,
                durationOfBreak: TimeSpan.FromMinutes(1)
            );

        private readonly TimeSpan _reconnectDelay = TimeSpan.FromSeconds(60);
        private DateTime _lastConnectionAttempt = DateTime.MinValue;

        public RabbitMessageConsumer(INoticationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
            TryInitializeRabbitMQWithRetry();
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
                        Uri = new Uri("amqp://guest:guest@rabbit-server:5672"),
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
                    string routingKey = "notification-routing-key";
                    string queueName = "notification_queue";

                    // Declare the exchange and queue, and bind them
                    _channel.ExchangeDeclare(exchangeName, ExchangeType.Direct);
                    _channel.QueueDeclare(queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
                    _channel.QueueBind(queueName, exchangeName, routingKey, null);


                    // Healthbook Reminder Exchange and Queue
                    string healthbookExchange = "HealthbookExchange";
                    string healthbookRoutingKey = "healthbook-reminder";
                    string healthbookQueue = "notification-healthbook-create";
                    // Declare healthbook exchange and queue
                    _channel.ExchangeDeclare(healthbookExchange, ExchangeType.Direct);
                    _channel.QueueDeclare(healthbookQueue, durable: false, exclusive: false, autoDelete: false, arguments: null);
                    _channel.QueueBind(healthbookQueue, healthbookExchange, healthbookRoutingKey, null);
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

        public async Task<Response> PushedNotificationConsumer()
        {
            // Attempt reconnection if not available
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
                        var result = await ProcessMessage(message);

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
                    queue: "notification_queue",
                    autoAck: false,
                    consumer: consumer);

                return new Response { Flag = true, Message = "Consumer started" };
            }
            catch (Exception ex)
            {
                IsRabbitAvailable = false;
                LogExceptions.LogToDebugger($"⚠️ RabbitMQ consumption error: {ex.Message}");
                return new Response { Flag = false, Message = $"Failed to start consumer: {ex.Message}" };
            }
        }

        public async Task<Response> HealthBookNotificationConsumer()
        {
            // Attempt reconnection if not available
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
                        var result = await ProcessHealthBookMessage(message);

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
                    queue: "notification-healthbook-create",
                    autoAck: false,
                    consumer: consumer);

                return new Response { Flag = true, Message = "Consumer started" };
            }
            catch (Exception ex)
            {
                IsRabbitAvailable = false;
                LogExceptions.LogToDebugger($"⚠️ RabbitMQ consumption error: {ex.Message}");
                return new Response { Flag = false, Message = $"Failed to start consumer: {ex.Message}" };
            }
        }

        private async Task<Response> ProcessMessage(string message)
        {
            try
            {
                PushNotificationDTO pushNotification = JsonConvert.DeserializeObject<PushNotificationDTO>(message);

                if (pushNotification != null)
                {
                    foreach (var receiver in pushNotification.Receivers)
                    {
                        try
                        {
                            // Process each receiver
                            var result = await _notificationRepository.PushSingleNotification(pushNotification.notificationId, receiver.UserId);

                            if (!result.Flag)
                            {
                                LogExceptions.LogToDebugger($"Error processing receiver: {receiver.UserId}");
                                return new Response { Flag = false, Message = $"Error processing receiver: {receiver.UserId}" };
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
                    LogExceptions.LogToDebugger("Failed to deserialize message to PushNotificationDTO.");
                    return new Response { Flag = false, Message = "Failed to deserialize message to PushNotificationDTO." };
                }
            }
            catch (JsonException ex)
            {
                LogExceptions.LogToDebugger($"Error deserializing JSON: {ex.Message}");
                return new Response { Flag = false, Message = "Failed to deserialize message to PushNotificationDTO." };
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"Error processing message: {ex.Message}");
                return new Response { Flag = false, Message = $"Error processing message: {ex.Message}" };
            }
        }

        private async Task<Response> ProcessHealthBookMessage(string message)
        {
            try
            {
                var pushNotification = JsonConvert.DeserializeObject<IEnumerable<HealthBookMessageDTO>>(message);

                if (pushNotification != null)
                {
                    foreach (var receiver in pushNotification)
                    {
                        try
                        {
                            //prepare title and content
                            string title = $"[PetEase] Reminder: {receiver.PetName}'s Visit on {receiver.nextVisitDate:MMMM dd}";
                            string content = "Please check your email for more detail";
                            var notification = new Notification
                            {
                                NotificationTitle = title,
                                NotificationContent = content,
                                CreatedDate = DateTime.Now,
                                NotiTypeId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                                IsPushed = true,
                                IsDeleted= false,
                            };
                            // Process each receiver
                            var result = await _notificationRepository.CreateHealthBookNotification(receiver.UserId, notification);

                            if (!result.Flag)
                            {
                                LogExceptions.LogToDebugger($"Error processing receiver: {receiver.UserId}");
                                return new Response { Flag = false, Message = $"Error processing receiver: {receiver.UserId}" };
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
                    LogExceptions.LogToDebugger("Failed to deserialize message to PushNotificationDTO.");
                    return new Response { Flag = false, Message = "Failed to deserialize message to PushNotificationDTO." };
                }
            }
            catch (JsonException ex)
            {
                LogExceptions.LogToDebugger($"Error deserializing JSON: {ex.Message}");
                return new Response { Flag = false, Message = "Failed to deserialize message to PushNotificationDTO." };
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"Error processing message: {ex.Message}");
                return new Response { Flag = false, Message = $"Error processing message: {ex.Message}" };
            }
        }
        public void Dispose()
        {
            try
            {
                _channel?.Close();
                _connection?.Close();
                _channel?.Dispose();
                _connection?.Dispose();
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"Error disposing RabbitMQ resources: {ex.Message}");
            }
        }
    }
}