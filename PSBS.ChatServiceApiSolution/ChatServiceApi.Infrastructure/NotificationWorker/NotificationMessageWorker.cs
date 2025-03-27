using ChatServiceApi.Infrastructure.RabbitMessaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ChatServiceApi.Infrastructure.NotificationWorker
{
    public class NotificationMessageWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationMessageWorker> _logger;
        private RabbitMessageConsumer _messageConsumer; // Hold a single instance

        public NotificationMessageWorker(IServiceScopeFactory scopeFactory, ILogger<NotificationMessageWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using (var scope = _scopeFactory.CreateScope()) //Create the scope once.
            {
                _messageConsumer = scope.ServiceProvider.GetRequiredService<RabbitMessageConsumer>(); // Get a single instance.
                var response = await _messageConsumer.PushedNotificationConsumer(); //start the consumer.
                if (!response.Flag)
                {
                    _logger.LogWarning("RabbitMQ issue: {Message}", response.Message);
                    return; // Stop the worker if the consumer fails to start.
                }

                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(5000, stoppingToken); //just keep the worker alive.
                }
            }
        }

        public override void Dispose()
        {
            _messageConsumer?.Dispose(); //Dispose the consumer.
            base.Dispose();
        }
    }
}