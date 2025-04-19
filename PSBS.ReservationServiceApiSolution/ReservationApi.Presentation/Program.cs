using ReservationApi.Infrastructure.DependencyInjection;
using VNPAY.NET;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseKestrel(options =>
{
    options.ListenAnyIP(5115); // HTTP
    options.ListenAnyIP(5201, listenOptions =>
    {
        listenOptions.UseHttps("https/aspnetapp.pfx", "1234"); 
    });
});



builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
// Add services to the container.
builder.Services.AddSingleton<IVnpay, Vnpay>();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructureService(builder.Configuration);
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
app.UseCors("AllowAllOrigins");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
