
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PSPS.SharedLibrary.DependencyInjection;
using VoucherApi.Application.Interfaces;
using VoucherApi.Infrastructure.Data;
using VoucherApi.Infrastructure.Repositories;

namespace VoucherApi.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity 
            // add authentication scheme
            SharedServiceContainer.AddSharedServices<RewardServiceDBContext>(services, config, config["MySerilog:FineName"]!);
            // create DI
            services.AddScoped<IVoucher, VoucherRepository>();
            services.AddScoped<IGift, GiftRepository>();
            services.AddScoped<IRedeemGiftHistory, RedeemGiftHistoryRepository>();

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
