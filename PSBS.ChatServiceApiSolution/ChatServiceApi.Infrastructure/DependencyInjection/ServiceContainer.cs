﻿

using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Application.Services;
using ChatServiceApi.Infrastructure.Data;
using ChatServiceApi.Infrastructure.NotificationWorker;
using ChatServiceApi.Infrastructure.RabbitMessaging;
using ChatServiceApi.Infrastructure.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PSPS.SharedLibrary.DependencyInjection;
using RabbitMQ.Client;

namespace ChatServiceApi.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity 
            // add authentication scheme
            SharedServiceContainer.AddSharedServices<ChatServiceDBContext>(services, config, config["MySerilog:FineName"]!);
            // create DI
            services.AddScoped<IChatRepository, ChatRepository>();
            services.AddScoped<IChatService, ChatService>();
            services.AddScoped<INoticationRepository, NotificationRepository>();
            // Reuse connections across requests
            services.AddSingleton<IConnection>(sp =>
                new ConnectionFactory().CreateConnection());
            if (!string.IsNullOrEmpty(config["RabbitMQ:Uri"]))
            {
                services.AddScoped<INotificationMessagePublisher, RabbitMQMessagePublisher>();
                services.AddScoped<RabbitMessageConsumer>();
            }
            else
            {
                services.AddScoped<INotificationMessagePublisher, NullMessagePublisher>(); // Fallback
                services.AddScoped<RabbitMessageConsumer>(_ =>
                    new RabbitMessageConsumer(null) { IsRabbitAvailable = false });
            }


            // Register the BackgroundService
            services.AddHostedService<NotificationMessageWorker>();
            return services;
        }
        public static IApplicationBuilder UserInfrastructurePolicy(this IApplicationBuilder app)
        {
            // register middleware such as:
            // Global exception: handles external errors
            // listen to only api gateway: block all outsider calls
            SharedServiceContainer.UserSharedPolicies(app);
            return app;
        }
    }
}
