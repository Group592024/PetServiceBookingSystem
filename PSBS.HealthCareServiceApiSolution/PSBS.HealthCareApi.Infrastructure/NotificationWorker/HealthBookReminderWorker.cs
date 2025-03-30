using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PSBS.HealthCareApi.Application.Interfaces;
using PSPS.SharedLibrary.PSBSLogs;


namespace PSBS.HealthCareApi.Infrastructure.NotificationWorker
{
    public class HealthBookReminderWorker : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(24);
        private readonly TimeSpan _firstRunDelay = TimeSpan.FromSeconds(30);
        private readonly TimeSpan _retryDelay = TimeSpan.FromMinutes(30);
        private readonly int _maxRetryAttempts = 3;

        public HealthBookReminderWorker(IServiceProvider services)
        {
            _services = services;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            LogExceptions.LogToDebugger("HealthBook Reminder Worker started.");
            await Task.Delay(_firstRunDelay, stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                bool processingComplete = false;
                int retryCount = 0;

                do
                {
                    try
                    {
                        using (var scope = _services.CreateScope())
                        {
                            var services = scope.ServiceProvider;
                            var notificationService = services.GetRequiredService<IPetHealthBook>();
                            var fetchDetailService = services.GetRequiredService<IFetchHealthBookDetail>();
                            var publishMessageService = services.GetRequiredService<IHealthBookPublisher>();

                            // Get upcoming visits
                            var upcomingVisits = await notificationService.GetUpcomingVisitsAsync(1);

                            if (upcomingVisits?.Any() != true)
                            {
                                LogExceptions.LogToDebugger("No upcoming visits found.");
                                processingComplete = true;
                                continue;
                            }
                            else
                            {
                                // Fetch details
                                var healthbooks = await fetchDetailService.FetchHealthBookDetailList(upcomingVisits);

                                if (healthbooks?.Any() != true)
                                {
                                    LogExceptions.LogToDebugger("No healthbook details found.");
                                    processingComplete = true;
                                    continue;
                                }
                                else
                                {
                                    // Publish with response handling
                                    var publishResponse = await publishMessageService.PublishHealthCareBookAsync(healthbooks);

                                    if (publishResponse.Flag)
                                    {
                                        LogExceptions.LogToDebugger($"Successfully published {healthbooks.Count()} healthbooks");
                                        processingComplete = true;
                                    }
                                    else
                                    {
                                        LogExceptions.LogToDebugger($"Publish failed: {publishResponse.Message}");
                                        retryCount++;
                                        await Task.Delay(_retryDelay, stoppingToken);
                                    }
                                }
                            }



                                LogExceptions.LogToDebugger($"Processing {upcomingVisits.Count()} visits...");
                         
                        }
                    }
                    catch (Exception ex)
                    {
                        LogExceptions.LogToDebugger($"Error in worker: {ex.Message}");
                        retryCount++;
                        await Task.Delay(_retryDelay, stoppingToken);
                    }

                } while (!processingComplete &&
                        retryCount <= _maxRetryAttempts &&
                        !stoppingToken.IsCancellationRequested);

                if (!processingComplete)
                {
                    LogExceptions.LogToDebugger($"Max retry attempts ({_maxRetryAttempts}) reached.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            LogExceptions.LogToDebugger("HealthBook Reminder Worker stopped.");
        }
    }
}