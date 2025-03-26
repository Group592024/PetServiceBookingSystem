

using ChatServiceApi.Infrastructure.RabbitMessaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ChatServiceApi.Infrastructure.NotificationWorker
{
    public class NotificationMessageWorker : BackgroundService
    {
    
        private readonly IServiceScopeFactory _scopeFactory;
        public NotificationMessageWorker(IServiceScopeFactory scopeFactory)
        { 
            _scopeFactory = scopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using (var scope =_scopeFactory.CreateScope())
            {
                var messageSubscriber = scope.ServiceProvider.GetRequiredService<RabbitMessageConsumer>();
                var response = await messageSubscriber.PushedNotificationConsumer();
                if (!response.Flag)
                {
                    // Handle any error during subscription
                    Console.WriteLine("Error subscribing to queue: " + response.Message);
                    return; // Exit if we failed to subscribe
                }

                // Keep the service running
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(5000, stoppingToken);  // Delay to prevent tight loops if needed
                }
            }

        }
    }
}
