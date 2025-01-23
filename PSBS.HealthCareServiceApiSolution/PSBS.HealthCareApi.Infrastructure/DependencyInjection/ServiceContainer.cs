using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSBS.HealthCareApi.Infrastructure.Repositories;
using PSPS.SharedLibrary.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            services.AddScoped<IPetHealthBook, PetHealthBookRepository>();
            services.AddScoped<IMedicine, MedicineRepository>();
            services.AddScoped<ITreatment, TreatmentRepository>();
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
