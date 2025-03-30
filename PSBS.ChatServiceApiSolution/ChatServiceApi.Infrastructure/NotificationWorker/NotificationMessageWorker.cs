using ChatServiceApi.Infrastructure.RabbitMessaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PSPS.SharedLibrary.Responses;
using System.Threading.Tasks;

namespace ChatServiceApi.Infrastructure.NotificationWorker
{
    public class NotificationMessageWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationMessageWorker> _logger;
        private Task _notificationConsumerTask;
        private Task _healthbookConsumerTask;

        public NotificationMessageWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<NotificationMessageWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var messageConsumer = scope.ServiceProvider.GetRequiredService<RabbitMessageConsumer>();

                // Start both consumers in parallel
                _notificationConsumerTask = RunConsumerAsync(
                    messageConsumer.PushedNotificationConsumer,
                    "Notification",
                    stoppingToken);

                _healthbookConsumerTask = RunConsumerAsync(
                    messageConsumer.HealthBookNotificationConsumer,
                    "HealthBook",
                    stoppingToken);

                // Wait for both tasks to complete (which they won't unless cancelled)
                await Task.WhenAll(_notificationConsumerTask, _healthbookConsumerTask);
            }
        }

        private async Task RunConsumerAsync(
            Func<Task<Response>> consumerAction,
            string consumerName,
            CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation($"Starting {consumerName} consumer...");
                    var response = await consumerAction();

                    if (!response.Flag)
                    {
                        _logger.LogWarning($"{consumerName} consumer failed: {response.Message}");
                        await Task.Delay(5000, stoppingToken); // Wait before retrying
                        continue;
                    }

                    // If successful, just wait until cancellation
                    await Task.Delay(Timeout.Infinite, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Expected during shutdown
                    throw;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error in {consumerName} consumer");
                    await Task.Delay(5000, stoppingToken); // Wait before retrying
                }
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping notification worker...");
            await base.StopAsync(cancellationToken);
        }
    }
}