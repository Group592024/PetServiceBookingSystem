using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Polly;
using Polly.CircuitBreaker;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Net.Sockets;
using System.Text;

namespace ChatServiceApi.Infrastructure.RabbitMessaging
{
    public class RabbitMQMessagePublisher : INotificationMessagePublisher, IDisposable
    {
        private  IConnection _connection;
        private  IModel _channel;
        private readonly bool _isRabbitAvailable;
        private readonly TimeSpan _reconnectDelay = TimeSpan.FromSeconds(30);
        private DateTime _lastConnectionAttempt = DateTime.MinValue;

        private  CircuitBreakerPolicy _circuitBreaker;
        public RabbitMQMessagePublisher(IConfiguration config)

        {
            var retryConfig = config.GetSection("RabbitMQ:RetryPolicy");

            _reconnectDelay = TimeSpan.FromMinutes(
                retryConfig.GetValue<int>("ReconnectDelayMinutes"));
            _circuitBreaker = Policy
                 .Handle<BrokerUnreachableException>()
                 .Or<SocketException>()
                 .CircuitBreaker(
                     exceptionsAllowedBeforeBreaking: retryConfig.GetValue<int>("AllowedFailures", 3),
                     durationOfBreak: TimeSpan.FromSeconds(
                         retryConfig.GetValue<int>("CircuitBreakSeconds", 60)) // Default 1 minute
                 );
            _isRabbitAvailable = TryInitializeRabbitMQWithRetry(config);
        }

        private bool TryInitializeRabbitMQWithRetry(IConfiguration config)
        {
            // Don't attempt if we recently tried
            if (DateTime.UtcNow - _lastConnectionAttempt < _reconnectDelay)
                return false;

            _lastConnectionAttempt = DateTime.UtcNow;

            if (_circuitBreaker.CircuitState == CircuitState.Open)
            {
              
                LogExceptions.LogToDebugger("⚠️ Circuit breaker is open - skipping RabbitMQ connection attempt");
                return false;
            }

            try
            {
                return _circuitBreaker.Execute(() =>
                {
                    var factory = new ConnectionFactory
                    {
                        Uri = new Uri("amqp://guest:guest@rabbit-server:5672"),
                        ClientProvidedName = "Rabbit Sender App",
                        AutomaticRecoveryEnabled = true,
                        NetworkRecoveryInterval = TimeSpan.FromSeconds(30),
                        RequestedHeartbeat = TimeSpan.FromSeconds(30),  // Explicit heartbeat
                        ContinuationTimeout = TimeSpan.FromSeconds(20), // Operation timeout
                        DispatchConsumersAsync = false               
                    };

                    _connection = factory.CreateConnection();
                    _channel = _connection.CreateModel();

                    // Declare with durable settings for better reliability
                    string exchangeName = "NotificationExchange";
                    string routingKey = "notification-routing-key";
                    string queueName = "notification_queue";

                    // Declare the exchange and queue, and bind them
                    _channel.ExchangeDeclare(exchangeName, ExchangeType.Direct);
                    _channel.QueueDeclare(queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
                    _channel.QueueBind(queueName, exchangeName, routingKey, null);

                    // Set up connection event handlers
                    _connection.ConnectionShutdown += (sender, args) =>
                        LogExceptions.LogToDebugger($"⚠️ RabbitMQ connection shut down: {args.ReplyText}");

                    _connection.ConnectionBlocked += (sender, args) =>
                        LogExceptions.LogToDebugger($"⚠️ RabbitMQ connection blocked: {args.Reason}");

                    _connection.ConnectionUnblocked += (sender, args) =>
                        LogExceptions.LogToDebugger("✅ RabbitMQ connection unblocked");

                    LogExceptions.LogToDebugger("✅ RabbitMQ publisher connection established");
                    return true;
                });
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"⚠️ RabbitMQ connection failed: {ex.Message}");
                return false;
            }
        }

        public async Task<Response> BatchingPushNotificationAsync(PushNotificationDTO pushNotification)
        {
            if (!_isRabbitAvailable)
            {
                LogExceptions.LogToDebugger("RabbitMQ unavailable - messages not published");
                return new Response
                {
                    Flag = false,
                    Message = "RabbitMQ is not available. Messages were not published."
                };
            }

            try
            {
                int batchSize = 100;
                int receiverCount = pushNotification.Receivers.Count;
                int publishedCount = 0;

                var publishTasks = new List<Task>();
                var batchLock = new object();

                for (int i = 0; i < receiverCount; i += batchSize)
                {
                    var batch = pushNotification.Receivers.Skip(i).Take(batchSize).ToList();
                    var batchNotification = new PushNotificationDTO(pushNotification.notificationId, batch, pushNotification.isEmail);
                    var messageBody = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(batchNotification));

                    // Use async publishing with confirmation
                    var task = Task.Run(() =>
                    {
                        lock (batchLock)
                        {
                            _channel.BasicPublish(
                                exchange: "NotificationExchange",
                                routingKey: "notification-routing-key",
                                basicProperties: null,
                                body: messageBody);
                            publishedCount += batch.Count;
                        }
                    });

                    publishTasks.Add(task);
                }

                await Task.WhenAll(publishTasks);

                return new Response
                {
                    Flag = true,
                    Message = $"Published {publishedCount} messages in batches successfully."
                };
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"Error publishing batch: {ex.Message}");
                return new Response
                {
                    Flag = false,
                    Message = "Failed to publish messages in batches.",
                    Data = ex
                };
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
            finally
            {
                GC.SuppressFinalize(this);
            }
        }

        public async Task<Response> SendEmailNotificationMessageAsync(SendNotificationDTO sendNotification)
        {
            if (!_isRabbitAvailable)
            {
                LogExceptions.LogToDebugger("RabbitMQ unavailable - messages not published");
                return new Response
                {
                    Flag = false,
                    Message = "RabbitMQ is not available. Messages were not published."
                };
            }

            try
            {
                int batchSize = 100;
                int receiverCount = sendNotification.Receivers.Count;
                int publishedCount = 0;

                var publishTasks = new List<Task>();
                var batchLock = new object();

                for (int i = 0; i < receiverCount; i += batchSize)
                {
                    var batch = sendNotification.Receivers.Skip(i).Take(batchSize).ToList();
                    var batchNotification = new SendNotificationDTO(sendNotification.notificationId,sendNotification.NotificationTitle, sendNotification.NotificationContent ,batch);
                    var messageBody = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(batchNotification));   
                    var mailMessage = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(sendNotification));
                    // Use async publishing with confirmation
                    var task = Task.Run(() =>
                    {
                        lock (batchLock)
                        {                       
                                _channel.BasicPublish(
                               exchange: "NotificationExchange",
                               routingKey: "notification-email-key",
                               basicProperties: null,
                               body: mailMessage);
                         
                            _channel.BasicPublish(
                                exchange: "NotificationExchange",
                                routingKey: "notification-routing-key",
                                basicProperties: null,
                                body: messageBody);
                            publishedCount += batch.Count;
                        }
                    });

                    publishTasks.Add(task);
                }

                await Task.WhenAll(publishTasks);

                return new Response
                {
                    Flag = true,
                    Message = $"Published {publishedCount} messages in batches successfully."
                };
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"Error publishing batch: {ex.Message}");
                return new Response
                {
                    Flag = false,
                    Message = "Failed to publish messages in batches.",
                    Data = ex
                };
            }
        }
    }
}