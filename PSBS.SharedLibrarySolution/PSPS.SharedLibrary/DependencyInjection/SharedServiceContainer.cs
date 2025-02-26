using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PSPS.SharedLibrary.MiddleWares;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.SharedLibrary.DependencyInjection
{
    public static class SharedServiceContainer
    {
        public static IServiceCollection AddSharedServices<TContext>
            (this IServiceCollection services, IConfiguration config, string fileName) where TContext : DbContext
        {
            services.AddDbContext<TContext>(option => option.UseSqlServer(config.GetConnectionString("Default"),
                sqlserverOption => sqlserverOption.EnableRetryOnFailure()));
            // configure serilog logging
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .WriteTo.Console()
                .WriteTo.Debug()
                .WriteTo.File(path: $"{fileName}-.text", restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Information,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mnn:ss.fff zzz} [{Level:u3}] {message:lj} {NewLine} {Exeption}",
                rollingInterval: RollingInterval.Day)
                .CreateLogger();


            // Add Jwt authentication scheme
            JWTAuthenticationScheme.AddJWTAuthenticationScheme(services, config);

            // Add CORS policy
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder.WithOrigins("http://localhost:3000", "http://localhost:51554") // Update this with your frontend URL
                                      .AllowAnyMethod()
                                      .AllowAnyHeader().AllowCredentials());
            });
            return services;
        }

        public static IApplicationBuilder UserSharedPolicies(this IApplicationBuilder app)
        {
            // Enable CORS
            app.UseCors("AllowSpecificOrigin");
            // Use global exception
            app.UseMiddleware<GlobalException>();
            // Register middleware to block all outsiders api calls
            // app.UseMiddleware<ListenToOnlyApiGateway>();
            return app;
        }
    }
}
