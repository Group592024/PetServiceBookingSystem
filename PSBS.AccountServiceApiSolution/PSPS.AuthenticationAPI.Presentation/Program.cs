using Microsoft.EntityFrameworkCore;
using PSPS.AccountAPI.Domain.Entities;
using PSPS.AccountAPI.Infrastructure.Data;
using PSPS.AccountAPI.Infrastructure.DependencyInjection;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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
var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAllOrigins");
app.UserInfrastructurePolicy();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
