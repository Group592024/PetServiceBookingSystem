using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PSPS.SharedLibrary.DependencyInjection;


namespace FacilityServiceApi.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity
            //Add authentication scheme
            SharedServiceContainer.AddSharedServices<FacilityServiceDbContext>(services, config, config["MySerilog:FineName"]!);

            //Create Dependency Injection
            services.AddScoped<IRoom, RoomRepository>();
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
