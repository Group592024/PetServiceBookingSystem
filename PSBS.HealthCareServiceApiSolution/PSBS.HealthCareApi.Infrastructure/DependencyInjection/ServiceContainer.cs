using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly.Retry;
using Polly;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSBS.HealthCareApi.Infrastructure.Repositories;
using PSPS.SharedLibrary.DependencyInjection;
using System.Net.Http.Headers;

using PSPS.SharedLibrary.PSBSLogs;
using PSBS.HealthCareApi.Infrastructure.Services;
using PSBS.HealthCareApi.Infrastructure.RabbitMessaging;
using PSBS.HealthCareApi.Infrastructure.NotificationWorker;


namespace PSBS.HealthCareApi.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity
            //Add authentication scheme
            SharedServiceContainer.AddSharedServices<HealthCareDbContext>(services, config, config["MySerilog:FineName"]!);

            //Create Dependency Injection
            services.AddScoped<IMedicine, MedicineRepository>();
            services.AddScoped<ITreatment, TreatmentRepository>();
            services.AddScoped<IPetHealthBook, PetHealthBookRepository>();
            services.AddScoped<IFetchHealthBookDetail, FetchHealthBookDetailService>();
            if (!string.IsNullOrEmpty(config["RabbitMQ:Uri"]))
            {
                services.AddScoped<IHealthBookPublisher, HealthBookPublisher>();            
            }
            else
            {
                services.AddScoped<IHealthBookPublisher, NullMessagePublisher>(); // Fallback             
            }
            services.AddDbContext<HealthCareDbContext>(options =>
        options.UseSqlServer(config.GetConnectionString("Default")));

            services.AddHttpClient("ApiGateway", client =>
            {
                client.BaseAddress = new Uri("http://localhost:5050/");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", config["MySerilog:DefaultToken"]!);
                client.DefaultRequestHeaders.Accept.Add(
       new MediaTypeWithQualityHeaderValue("application/json"));
            });

            // create Retry Strategy
            var retryStrategy = new RetryStrategyOptions()
            {
                ShouldHandle = new PredicateBuilder().Handle<TaskCanceledException>(),
                BackoffType = DelayBackoffType.Constant,
                UseJitter = true,
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromMilliseconds(500),
                OnRetry = args =>
                {
                    string message = $"OnRetry, Attempt: {args.AttemptNumber} OutCome {args.Outcome}";
                    LogExceptions.LogToConsole(message);
                    LogExceptions.LogToDebugger(message);
                    return ValueTask.CompletedTask;
                }
            };

            // use Retry strategy
            services.AddResiliencePipeline("my-retry-pipeline", builder =>
            {
                builder.AddRetry(retryStrategy);
            });

            services.AddHostedService<HealthBookReminderWorker>();
            return services;
        }

        public static IApplicationBuilder UseInfrastructurePolicy(this IApplicationBuilder app)
        {
            //Register middleware
            SharedServiceContainer.UserSharedPolicies(app); ;
            return app;

        }
    }
}
