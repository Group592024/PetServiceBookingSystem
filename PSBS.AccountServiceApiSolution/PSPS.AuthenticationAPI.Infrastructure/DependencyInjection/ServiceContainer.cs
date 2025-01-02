using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.AccountAPI.Infrastructure.Data;
using PSPS.AccountAPI.Infrastructure.Repositories;
using PSPS.SharedLibrary.DependencyInjection;


namespace PSPS.AccountAPI.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity
            // JWT Add Authentication Scheme
            SharedServiceContainer.AddSharedServices<PSPSDbContext>(services, config, config["MySerilog:FileName"]!);
            // Create Dependency Injection
            services.AddScoped<IAccount, AccountRepository>();
            services.AddScoped<IEmail, EmailRepository>();


            return services;
        }
        public static IApplicationBuilder UserInfrastructurePolicy(this IApplicationBuilder app) { 
            //Register middleware such as:
            //Global Exception: Handle external errors
            // Listen only to api gateway: block all outsiders call
            SharedServiceContainer.UserSharedPolicies(app);
                return app; 
         }
    }
}

