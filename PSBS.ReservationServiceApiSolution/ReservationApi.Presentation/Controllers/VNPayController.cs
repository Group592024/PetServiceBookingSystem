using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PSPS.SharedLibrary.PSBSLogs;
using VNPAY.NET.Enums;
using VNPAY.NET.Models;
using VNPAY.NET.Utilities;
using VNPAY.NET;
using ReservationApi.Application.Intefaces;
using ReservationApi.Infrastructure.Data;
using PSPS.SharedLibrary.Responses;
using Microsoft.AspNetCore.Authorization;
using System.Net;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ReservationApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class VNPayController : ControllerBase
    {
        private readonly IVnpay vnpay;
        private readonly IBooking bookingInterface;
        private readonly ReservationServiceDBContext context;
        private readonly IConfiguration configuration;
        public VNPayController(IBooking _bookingInterface, ReservationServiceDBContext _context, IVnpay vnPayservice, IConfiguration _configuration, IPointRule _pointRuleInterface)
        {
            vnpay = vnPayservice;
            configuration = _configuration;
            context = _context;
            bookingInterface = _bookingInterface;
            var tmnCode = configuration["Vnpay:TmnCode"];
            var hashSecret = configuration["Vnpay:HashSecret"];
            var baseUrl = configuration["Vnpay:BaseUrl"];
            var callbackUrl = configuration["Vnpay:CallbackUrl"];

            Console.WriteLine($"TmnCode: {tmnCode}");
            Console.WriteLine($"HashSecret: {hashSecret}");
            Console.WriteLine($"BaseUrl: {baseUrl}");
            Console.WriteLine($"CallbackUrl: {callbackUrl}");

            if (string.IsNullOrEmpty(tmnCode) || string.IsNullOrEmpty(hashSecret) || string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(callbackUrl))
            {
                throw new ArgumentException("Không tìm thấy BaseUrl, TmnCode, HashSecret, hoặc CallbackUrl");
            }

            vnpay.Initialize(tmnCode, hashSecret, baseUrl, callbackUrl);
            //vnpay.Initialize(configuration["Vnpay:TmnCode"], configuration["Vnpay:HashSecret"], configuration["Vnpay:BaseUrl"], configuration["Vnpay:CallbackUrl"]);
        }

        [HttpGet("CreatePaymentUrl")]
        [AllowAnonymous]
        public ActionResult<string> CreatePaymentUrl(double moneyToPay, string description)
        {
            try
            {
                Console.WriteLine($"CreatePaymentUrl called with moneyToPay: {moneyToPay}, description: {description}");



              var  ipAddress = "127.0.0.1"; // Lấy địa chỉ IP của thiết bị thực hiện giao dịch
                Console.WriteLine($"IP Address: {ipAddress}");
                var request = new PaymentRequest
                {
                    PaymentId = DateTime.Now.Ticks,
                    Money = moneyToPay,
                    Description = description,
                    IpAddress = ipAddress,
                    BankCode = BankCode.ANY, // Tùy chọn. Mặc định là tất cả phương thức giao dịch
                    CreatedDate = DateTime.Now, // Tùy chọn. Mặc định là thời điểm hiện tại
                    Currency = Currency.VND, // Tùy chọn. Mặc định là VND (Việt Nam đồng)
                    Language = DisplayLanguage.Vietnamese,
                };
                var paymentUrl = vnpay.GetPaymentUrl(request);
  Console.WriteLine($"Payment URL generated: {paymentUrl}");
                return Created(paymentUrl, paymentUrl);
            }
            catch (Exception ex)
            {
                 Console.WriteLine($"Error in CreatePaymentUrl: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("IpnAction")]
        [AllowAnonymous]
        public async Task<IActionResult> IpnAction()
        {
            if (Request.QueryString.HasValue)
            {
                try
                {
                    var paymentResult = vnpay.GetPaymentResult(Request.Query);
                    var descriptionJson = Request.Query["vnp_OrderInfo"].ToString();

                    // Parse the JSON description
                    var description = JsonConvert.DeserializeObject<dynamic>(descriptionJson);
                    string bookingCode = description.bookingCode;
                    string redirectPath = description.redirectPath;
                    LogExceptions.LogToConsole(redirectPath);
                    if (paymentResult.IsSuccess)
                    {

                        var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
                        if (existingBooking == null)
                        {
                            return Redirect($"http://localhost:3000{redirectPath}?status=failed");
                        }

                        existingBooking.isPaid = true;
                        context.Bookings.Update(existingBooking);
                        await context.SaveChangesAsync();
                        // Thực hiện hành động nếu thanh toán thành công tại đây. Ví dụ: Cập nhật trạng thái đơn hàng trong cơ sở dữ liệu.
                        return Ok();
                    }

                    // Thực hiện hành động nếu thanh toán thất bại tại đây. Ví dụ: Hủy đơn hàng.
                    return BadRequest("Thanh toán thất bại");
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            return NotFound("Không tìm thấy thông tin thanh toán.");
        }

        [HttpGet("Vnpay/Callback")]
        [AllowAnonymous]
        public async Task<IActionResult> Callback()
        {
            if (Request.QueryString.HasValue)
            {
                try
                {
                    // Log all incoming query parameters
                    foreach (var key in Request.Query.Keys)
                    {
                        Console.WriteLine($"{key}: {Request.Query[key]}");
                    }

                    var paymentResult = vnpay.GetPaymentResult(Request.Query);
                    var descriptionJson = Request.Query["vnp_OrderInfo"].ToString();

                    // Parse the JSON description
                    var description = JsonConvert.DeserializeObject<dynamic>(descriptionJson);
                    string bookingCode = description.bookingCode;
                    string redirectPath = description.redirectPath;

                    Console.WriteLine($"Booking Code: {bookingCode}");
                    Console.WriteLine($"Redirect Path: {redirectPath}");
                    Console.WriteLine($"Payment Success: {paymentResult.IsSuccess}");

                    if (paymentResult.IsSuccess)
                    {
                        var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
                        if (existingBooking == null)
                        {
                            Console.WriteLine("Booking not found in database");
                            return Redirect($"http://localhost:3000{redirectPath}?status=failed");
                        }

                        Console.WriteLine($"Found booking: {existingBooking.BookingId}");

                        // Update payment status
                        existingBooking.isPaid = true;
                        context.Bookings.Update(existingBooking);

                        try
                        {
                            await context.SaveChangesAsync();
                            Console.WriteLine("Successfully updated booking payment status");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error saving booking: {ex.Message}");
                            return Redirect($"http://localhost:3000{redirectPath}?status=dberror");
                        }

                        // Add delay to ensure update completes before redirect
                        await Task.Delay(500);

                        return Redirect($"http://localhost:3000{redirectPath}?status=success");
                    }

                    return Redirect($"http://localhost:3000{redirectPath}?status=failed");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error in callback: {ex.Message}");
                    return Redirect($"http://localhost:3000/customer/bookings?status=error");
                }
            }

            Console.WriteLine("No query string received");
            return Redirect("http://localhost:3000/customer/bookings?status=notfound");
        }

        // [HttpGet("Vnpay/Callback/update-status")]
        // [AllowAnonymous]
        // public async Task<IActionResult> CallbackVnPayToUpdatePaidStatus(string bookingCode)
        // {
        //     try
        //     {
        //         var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
        //         if (existingBooking == null)
        //         {
        //             LogExceptions.LogToConsole("Booking not found in database");
        //             return BadRequest(new Response(false, "Booking not found in database!"));
        //         }

        //         LogExceptions.LogToConsole($"Found booking: {existingBooking.BookingId}");

        //         // Update payment status
        //         existingBooking.isPaid = true;
        //         context.Bookings.Update(existingBooking);
        //         await context.SaveChangesAsync();
        //         Console.WriteLine("Successfully updated booking payment status");

        //         return Ok(new Response(true, "Payment status updated successfully!"));
        //     }
        //     catch (Exception ex)
        //     {
        //         LogExceptions.LogToConsole($"Error saving booking: {ex.Message}");
        //         return StatusCode(500, new Response(false, "Error updating payment status"));
        //     }
        // }
    }
}
