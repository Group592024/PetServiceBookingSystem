using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Infrastructure.DependencyInjection;
using FacilityServiceApi.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Thêm logging để debug
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Đăng ký service
builder.Services.AddScoped<IRoomType, RoomTypeRepository>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});


builder.Services.AddEndpointsApiExplorer();
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

// Cấu hình cổng Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5023);
});


// Đăng ký FfmpegService
// builder.Services.AddSingleton<FacilityServiceApi.Infrastructure.Services.FfmpegService>();
builder.Services.AddInfrastructureService(builder.Configuration);
// builder.Services.Configure<ApiBehaviorOptions>(options =>
// {
//     options.SuppressModelStateInvalidFilter = true;
// });

// Đăng ký quyền
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

//var ffmpegService = app.Services.GetRequiredService<FacilityServiceApi.Infrastructure.Services.FfmpegService>();
//var ffmpegProcess = ffmpegService.StartFfmpegConversion();
// var hlsOutputPath = builder.Configuration["CameraConfig:HlsOutputPath"];
// var hlsFileProvider = new PhysicalFileProvider(hlsOutputPath);


// Khởi động FfmpegService (kiểm tra lỗi)
// try
// {
//     var ffmpegService = app.Services.GetRequiredService<FacilityServiceApi.Infrastructure.Services.FfmpegService>();
//     var ffmpegProcess = ffmpegService.StartFfmpegConversion();
// }
// catch (Exception ex)
// {
//     Console.WriteLine($"Error starting FfmpegService: {ex.Message}");
// }

// // Cấu hình Static Files
// var hlsOutputPath = builder.Configuration["CameraConfig:HlsOutputPath"];
// var hlsFileProvider = new PhysicalFileProvider(hlsOutputPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Images")),
    RequestPath = "/Images"
});

// app.UseStaticFiles(new StaticFileOptions
// {
//     FileProvider = hlsFileProvider,
//     RequestPath = "/hls",
//     ServeUnknownFileTypes = true,
//     DefaultContentType = "application/vnd.apple.mpegurl",
//     OnPrepareResponse = ctx =>
//     {
//         ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*"); 
//         ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
//         ctx.Context.Response.Headers.Append("Pragma", "no-cache");
//         ctx.Context.Response.Headers.Append("Expires", "0");
//     }
// });



// app.UseStaticFiles(new StaticFileOptions
// {
//     FileProvider = hlsFileProvider,
//     RequestPath = "/hls",
//     ServeUnknownFileTypes = true,
//     DefaultContentType = "application/vnd.apple.mpegurl",
//     OnPrepareResponse = ctx =>
//     {
//         ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
//         ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
//         ctx.Context.Response.Headers.Append("Pragma", "no-cache");
//         ctx.Context.Response.Headers.Append("Expires", "0");
//     }
// });

// Xử lý exception
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAllOrigins");
app.UseInfrastructurePolicy();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Định tuyến Controller
app.MapControllers();

// Khởi động ứng dụng
app.Run();
