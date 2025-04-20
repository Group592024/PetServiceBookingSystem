using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using PSPS.AccountAPI.Domain.Entities;
using PSPS.AccountAPI.Infrastructure.Data;
using PSPS.AccountAPI.Infrastructure.DependencyInjection;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.WebHost.UseUrls("http://0.0.0.0:5001");

builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddDbContext<PSPSDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddInfrastructureService(builder.Configuration);
builder.Services.Configure<EmailSetting>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5001); // Any IP with 5023
});
builder.Services.AddHttpClient("ApiGateway", client =>
{
    client.BaseAddress = new Uri("http://gatewayapi:5050/");
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OnlyAdmin", policy => policy.RequireRole("admin"));
    options.AddPolicy("OnlyStaff", policy => policy.RequireRole("staff"));
    options.AddPolicy("OnlyUser", policy => policy.RequireRole("user"));
    options.AddPolicy("AdminOrStaff", policy => policy.RequireRole("admin", "staff"));
    options.AddPolicy("AdminOrStaffOrUser", policy => policy.RequireRole("admin", "staff", "user"));
    options.AddPolicy("StaffOrUser", policy => policy.RequireRole("staff", "user"));
});

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "images")), // Replace "images" with your folder name
    RequestPath = "/images" // The URL path to access the images (e.g., /images/myimage.jpg)
});
app.UseCors("AllowAllOrigins");
app.UserInfrastructurePolicy();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
