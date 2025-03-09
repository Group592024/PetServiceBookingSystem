using Microsoft.Extensions.FileProviders;
using VoucherApi.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowAllOrigins",
//         builder => builder.WithOrigins("http://localhost:3000")
//                            .AllowAnyOrigin()
//                           .AllowAnyMethod()
//                           .AllowAnyHeader());
// });
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
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
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "ImageGifts")),
    RequestPath = "/ImageGifts"
});
app.UserInfrastructurePolicy();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
