

using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Polly;
using Polly.CircuitBreaker;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.Interfaces;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Net.Sockets;
using System.Text;

namespace PSBS.HealthCareApi.Infrastructure.RabbitMessaging
{
    public class HealthBookPublisher : IHealthBookPublisher
    {
        private IConnection _connection;
        private IModel _channel;
        private readonly bool _isRabbitAvailable;
        private readonly TimeSpan _reconnectDelay = TimeSpan.FromSeconds(30);
        private DateTime _lastConnectionAttempt = DateTime.MinValue;
        private CircuitBreakerPolicy _circuitBreaker;


        public HealthBookPublisher(IConfiguration config)

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

                    // Healthbook Reminder Exchange and Queue
                    string healthbookExchange = "HealthbookExchange";
                    string healthbookRoutingKey = "healthbook-reminder";
                    string healthbookQueue = "send-healthbook-reminder";

                    // Declare healthbook exchange and queue
                    _channel.ExchangeDeclare(healthbookExchange, ExchangeType.Direct);
                    _channel.QueueDeclare(healthbookQueue, durable: false, exclusive: false, autoDelete: false, arguments: null);
                    _channel.QueueBind(healthbookQueue, healthbookExchange, healthbookRoutingKey, null);


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

        public async Task<Response> PublishHealthCareBookAsync(IEnumerable<HealthBookMessageDTO> healthBooks)
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
                int receiverCount = healthBooks.Count();
                int publishedCount = 0;

                var publishTasks = new List<Task>();
                var batchLock = new object();

                for (int i = 0; i < receiverCount; i += batchSize)
                {
                    var batch = healthBooks.Skip(i).Take(batchSize).ToList();               
                    var messageBody = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(batch));

                    // Use async publishing with confirmation
                    var task = Task.Run(() =>
                    {
                        lock (batchLock)
                        {
                            _channel.BasicPublish(
                                exchange: "HealthbookExchange",
                                routingKey: "healthbook-reminder",
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
