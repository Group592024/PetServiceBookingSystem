

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PSPS.SharedLibrary.DependencyInjection;
using ReservationApi.Application.Intefaces;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Repositories;

namespace ReservationApi.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            //Add database connectivity 
            // add authentication scheme
            SharedServiceContainer.AddSharedServices<ReservationServiceDBContext>(services, config, config["MySerilog:FineName"]!);
            // create DI
            services.AddScoped<IBooking, BookingRepository>();
             services.AddScoped<IBookingStatus, BookingStatusRepository>();
             services.AddScoped<IBookingType, BookingTypeRepository>();
            services.AddScoped<IPointRule, PointRuleRepository>();
            services.AddScoped<IPaymentType, PaymentTypeRepository>();
            
            services.AddScoped<IReport, ReportBookingRepository>();
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
