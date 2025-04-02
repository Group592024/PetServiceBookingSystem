using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PSPS.AccountAPI.Infrastructure.RabbitMessing;
using PSPS.SharedLibrary.Responses;

namespace PSPS.AccountAPI.Infrastructure.NotificationWorker
{
    public class NotificationMessageWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationMessageWorker> _logger;
        private RabbitMessageConsumer _messageConsumer;
        private Task _notificationConsumerTask;
        private Task _reminderConsumerTask;

        public NotificationMessageWorker(IServiceScopeFactory scopeFactory, ILogger<NotificationMessageWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                _messageConsumer = scope.ServiceProvider.GetRequiredService<RabbitMessageConsumer>();

                // Start both consumers in parallel
                var notificationTask = StartNotificationConsumer(stoppingToken);
                var reminderTask = StartReminderConsumer(stoppingToken);

                // Wait for both tasks to complete (which they won't unless cancelled)
                await Task.WhenAll(notificationTask, reminderTask);
            }
        }

        private async Task StartNotificationConsumer(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var response = await _messageConsumer.SendNotificationEmailConsumer();
                    if (!response.Flag)
                    {
                        _logger.LogWarning("Notification consumer failed: {Message}", response.Message);
                        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait before retrying
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
                    _logger.LogError(ex, "Error in notification consumer");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait before retrying
                }
            }
        }

        private async Task StartReminderConsumer(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var response = await _messageConsumer.SendReminderEmailConsumer();
                    if (!response.Flag)
                    {
                        _logger.LogWarning("Reminder consumer failed: {Message}", response.Message);
                        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait before retrying
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
                    _logger.LogError(ex, "Error in reminder consumer");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait before retrying
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