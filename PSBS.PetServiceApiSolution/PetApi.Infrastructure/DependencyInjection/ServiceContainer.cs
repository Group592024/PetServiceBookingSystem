using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PetApi.Application.Interfaces;
using PetApi.Infrastructure.Data;
using PetApi.Infrastructure.Repositories;
using PSPS.SharedLibrary.DependencyInjection;

namespace PetApi.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity
            //Add authentication scheme
            SharedServiceContainer.AddSharedServices<PetDbContext>(services, config, config["MySerilog:FineName"]!);

            //Create Dependency Injection
            services.AddScoped<IPetType, PetTypeRepository>();
            services.AddScoped<IPetBreed, PetBreedRepository>();
            services.AddScoped<IPet, PetRepository>();

            services.AddScoped<IPetDiary, PetDiaryRepository>();

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
