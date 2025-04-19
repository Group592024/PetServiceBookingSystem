
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Data.Migrations;
using System.Drawing;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;
using VNPAY.NET;
using VNPAY.NET.Enums;
using VNPAY.NET.Models;
using VNPAY.NET.Utilities;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ReservationApi.Presentation.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IVnpay vnpay;
        private readonly IBooking bookingInterface;
        private readonly ReservationServiceDBContext context;
        private readonly IConfiguration configuration;
        private readonly IPointRule pointRuleInterface;
        public BookingsController(IBooking _bookingInterface, ReservationServiceDBContext _context, IVnpay vnPayservice, IConfiguration _configuration, IPointRule _pointRuleInterface)
        {
            vnpay = vnPayservice;
            configuration = _configuration;
            context = _context;
            bookingInterface = _bookingInterface;
            pointRuleInterface = _pointRuleInterface;
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

        // GET: api/<BookingsController>

        [HttpGet]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> GetBookingsForAdmin()
        {
            var bookings = await bookingInterface.GetAllAsync();
            if (!bookings.Any())
            {
                return NotFound(new Response(false, "No bookings detected"));
            }
            var (_, listBookings) = BookingConversion.FromEntity(null!, bookings);

            return Ok(new Response(true, "Bookings retrieved successfully!")
            {
                Data = listBookings
            });
        }
        [HttpGet("list/{id}")]
        [Authorize(Policy = "OnlyUser")]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> GetBookingsForUser(Guid id)
        {
            var bookings = await bookingInterface.GetAllBookingForUserAsync(id);
            if (!bookings.Any())
            {
                return NotFound(new Response(false, "No bookings detected"));
            }
            var (_, listBookings) = BookingConversion.FromEntity(null!, bookings);

            return Ok(new Response(true, "Bookings retrieved successfully!")
            {
                Data = listBookings
            });
        }

        // GET api/<BookingsController>/5
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<BookingDTO>> GetBookingByIdForAdmin(Guid id)
        {
            var booking = await bookingInterface.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound(new Response(false, "The room requested not found"));
            }
            var (findingBooking, _) = BookingConversion.FromEntity(booking, null!);
            return Ok(new Response(true, "The booking retrieved successfully")
            {
                Data = findingBooking
            });
        }

        // POST api/<BookingsController>
        [HttpPost]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> CreateBooking([FromForm] AddBookingDTO addBookingDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Input invalid")
                {
                    Data = ModelState
                });
            }
            var getEntity = BookingConversion.ToEntityForCreate(addBookingDTO);
            var response = await bookingInterface.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // POST Room api/<BookingsController>
        [HttpPost("room")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> CreateBookingRoom([FromBody] BookingRoomRequestDTO bookingRequest)
        {
            try
            {
                var latestBookingDateRoom = DateTime.Now;

                // Log received booking request
                Console.WriteLine("Received Booking Request:");
                Console.WriteLine($"Selected Option: {bookingRequest.SelectedOption}");
                Console.WriteLine($"Voucher ID: {bookingRequest.VoucherId}");
                Console.WriteLine($"Total Price: {bookingRequest.TotalPrice}");
                Console.WriteLine($"Discounted Price: {bookingRequest.DiscountedPrice}");

                // Log customer details
                Console.WriteLine("\nCustomer Details:");
                Console.WriteLine($"ID: {bookingRequest.Customer.CusId}");
                Console.WriteLine($"Name: {bookingRequest.Customer.Name}");
                Console.WriteLine($"Address: {bookingRequest.Customer.Address}");
                Console.WriteLine($"Phone: {bookingRequest.Customer.Phone}");
                Console.WriteLine($"Payment Method: {bookingRequest.Customer.PaymentMethod}");
                Console.WriteLine($"Note: {bookingRequest.Customer.Note}");

                // Log booking room details
                Console.WriteLine("\nBooking Rooms:");
                foreach (var room in bookingRequest.BookingRooms)
                {
                    Console.WriteLine($"Room ID: {room.Room}");
                    Console.WriteLine($"Pet ID: {room.Pet}");
                    Console.WriteLine($"Start: {room.Start}");
                    Console.WriteLine($"End: {room.End}");
                    Console.WriteLine($"Price: {room.Price}");
                    Console.WriteLine($"Camera: {room.Camera}");
                    Console.WriteLine("----------------------------");
                }
                for (int i = 0; i < bookingRequest.BookingRooms.Count; i++)
                {
                    if (i == 0) latestBookingDateRoom = bookingRequest.BookingRooms[i].Start;
                    if (bookingRequest.BookingRooms[i].Start < latestBookingDateRoom) latestBookingDateRoom = bookingRequest.BookingRooms[i].Start;
                    Console.WriteLine($"Index: {i}");
                    Console.WriteLine($"BookingDattelst ID: {latestBookingDateRoom}");
                }

                //token
                string authorizationHeader = Request.Headers["Authorization"];
                string token = authorizationHeader.Substring("Bearer ".Length).Trim();

                //check booking confirmed
                var bookingStatusPending = await context.BookingStatuses.FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains("Pending"));
                var bookingTypeRoom = await context.BookingTypes.Where(bt => bt.BookingTypeName.Contains("Hotel")).FirstOrDefaultAsync();
                var bookingAllPendingList = await bookingInterface.GetBookingByBookingStatusAsync(bookingStatusPending.BookingStatusId);
                var bookingHotelPendingList = bookingAllPendingList.Where(b => b.BookingTypeId == bookingTypeRoom.BookingTypeId).ToList();
                LogExceptions.LogToConsole(bookingHotelPendingList.ToString());
                foreach (var room in bookingRequest.BookingRooms)
                {
                    // Inside the CreateBookingRoom method, modify the room history check:

                    foreach (var bookingroom in bookingHotelPendingList)
                    {
                        List<RoomHistoryDTO> bookingroomDetail = new List<RoomHistoryDTO>();

                        using (HttpClient client = new HttpClient())
                        {
                            client.BaseAddress = new Uri("http://localhost:5050/api/");
                            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                            HttpResponseMessage roomHistoryResponse = await client.GetAsync($"RoomHistories/{bookingroom.BookingId}");

                            // If response is successful, process the room histories
                            if (roomHistoryResponse.IsSuccessStatusCode)
                            {
                                var jsonResponse = await roomHistoryResponse.Content.ReadAsStringAsync();
                                var responseObject = JObject.Parse(jsonResponse);

                                bool flag = responseObject["flag"]?.Value<bool>() ?? false;

                                // Only process if the response indicates success
                                if (flag)
                                {
                                    var roomHistoryData = responseObject["data"]?.ToObject<List<RoomHistoryDTO>>();
                                    if (roomHistoryData != null && roomHistoryData.Any())
                                    {
                                        bookingroomDetail = roomHistoryData;

                                        // Check for overlapping bookings
                                        foreach (var roomHistory in bookingroomDetail)
                                        {
                                            // Simplified overlap detection
                                            bool isOverlapping = room.Start < roomHistory.bookingEndDate &&
                                                                room.End > roomHistory.bookingStartDate &&
                                                                room.Room == roomHistory.roomId;

                                            if (isOverlapping)
                                            {
                                                return BadRequest(new
                                                {
                                                    flag = false,
                                                    message = $"The room is already booked from {roomHistory.bookingStartDate} to {roomHistory.bookingEndDate}"
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                            // If response is 404 (Not Found), it means there are no room histories yet, which is fine
                            else if (roomHistoryResponse.StatusCode == System.Net.HttpStatusCode.NotFound)
                            {
                                // No room histories for this booking, so no conflicts to check
                                continue;
                            }
                            // For other error responses, return an appropriate error
                            else
                            {
                                var errorContent = await roomHistoryResponse.Content.ReadAsStringAsync();
                                LogExceptions.LogToConsole($"Error retrieving room histories: {errorContent}");
                                return BadRequest(new Response(false, "Error checking room availability. Please try again."));
                            }
                        }
                    }

                }

                //create booking 
                var bookingTypeRequest = await context.BookingTypes.Where(bt => bt.BookingTypeName.Contains("Hotel")).FirstOrDefaultAsync();
                Console.WriteLine("BookingType Id" + bookingTypeRequest.BookingTypeId);

                var bookingStatusRequest = await context.BookingStatuses.Where(bt => bt.BookingStatusName.Contains("Pending")).FirstOrDefaultAsync();
                Console.WriteLine("BookingStatus Id" + bookingTypeRequest.BookingTypeId);
                var createBookingDetail = new AddBookingDTO(bookingRequest.Customer.CusId, new Guid(bookingRequest.Customer.PaymentMethod), bookingRequest.VoucherId, bookingTypeRequest.BookingTypeId, bookingStatusRequest.BookingStatusId, Guid.Empty, bookingRequest.DiscountedPrice, bookingRequest.Customer.Note);
                var createEntity = BookingConversion.ToEntityForCreate(createBookingDetail);
                createEntity.BookingDate = latestBookingDateRoom;
                LogExceptions.LogToConsole("Booking room date" + createEntity.BookingDate);
                Console.WriteLine(createEntity.ToString());
                var bookingResponse = await bookingInterface.CreateAsync(createEntity);
                if (!bookingResponse.Flag)
                {
                    return BadRequest(bookingResponse);
                }
                //Create Room History
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    client.BaseAddress = new Uri("http://localhost:5050/api/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Call RoomHistories API for each booked room
                    foreach (var room in bookingRequest.BookingRooms)
                    {
                        var roomHistoryDTO = new CreateRoomHistoryDTO
                        {
                            PetId = room.Pet,
                            RoomId = room.Room,
                            BookingId = createEntity.BookingId,
                            BookingStartDate = room.Start,
                            BookingEndDate = room.End,
                            BookingCamera = room.Camera
                        };

                        HttpResponseMessage roomHistoryResponse = await client.PostAsJsonAsync("RoomHistories", roomHistoryDTO);

                        if (!roomHistoryResponse.IsSuccessStatusCode)
                        {
                            Console.WriteLine($"Failed to create room history for Room ID: {room.Room}");

                            var deleteInvalidBooking = await context.Bookings.FirstOrDefaultAsync(b => b.BookingId == createEntity.BookingId);
                            context.Bookings.Remove(deleteInvalidBooking);
                            await context.SaveChangesAsync();
                            return BadRequest(new Response(false, "Fail to create a booking."));
                        }
                    }
                }
                if (bookingRequest.VoucherId != Guid.Empty)
                {
                    using (HttpClient client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                        client.BaseAddress = new Uri("http://localhost:5050/api/Voucher/");
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        if (bookingRequest.VoucherId != null && bookingRequest.VoucherId != Guid.Empty)
                        {
                            HttpResponseMessage voucherResponse = await client.PutAsync($"update-quantity/{bookingRequest.VoucherId}", null);

                            if (!voucherResponse.IsSuccessStatusCode)
                            {
                                Console.WriteLine($"Failed to update voucher quantity. Status: {voucherResponse.StatusCode}");
                                var deleteInvalidBooking = await context.Bookings.FirstOrDefaultAsync(b => b.BookingId == createEntity.BookingId);
                                context.Bookings.Remove(deleteInvalidBooking);
                                await context.SaveChangesAsync();
                                return BadRequest(new Response(false, "Fail to create a booking."));
                            }
                        }
                    }
                }
                var createdBooking = await bookingInterface.GetByIdAsync(createEntity.BookingId);
                return Ok(new Response(true, "Add booking room success") { Data = createdBooking.BookingCode });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return BadRequest(new { success = false, message = "Error processing booking", error = ex.Message });

            }
        }

        [HttpPost("service")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> CreateBookingService([FromBody] BookingServiceRequestDTO bookingRequest)
        {
            try
            {
                // Log received booking request
                Console.WriteLine("Received Booking Service Request:");
                Console.WriteLine($"Selected Option: {bookingRequest.SelectedOption}");
                Console.WriteLine($"Voucher ID: {bookingRequest.VoucherId}");
                Console.WriteLine($"Total Price: {bookingRequest.TotalPrice}");
                Console.WriteLine($"Discounted Price: {bookingRequest.DiscountedPrice}");

                // Log customer details
                Console.WriteLine("\nCustomer Details:");
                Console.WriteLine($"ID: {bookingRequest.Customer.CusId}");
                Console.WriteLine($"Name: {bookingRequest.Customer.Name}");
                Console.WriteLine($"Address: {bookingRequest.Customer.Address}");
                Console.WriteLine($"Phone: {bookingRequest.Customer.Phone}");
                Console.WriteLine($"Payment Method: {bookingRequest.Customer.PaymentMethod}");
                Console.WriteLine($"Note: {bookingRequest.Customer.Note}");

                // Log service details
                Console.WriteLine("\nSelected Services:");
                foreach (var service in bookingRequest.Services)
                {
                    Console.WriteLine($"Service ID: {service.Service}");
                    Console.WriteLine($"Pet ID: {service.Pet}");
                    Console.WriteLine($"Price: {service.Price}");
                    Console.WriteLine($"Service Variant: {service.ServiceVariant}");
                    Console.WriteLine("----------------------------");
                }

                //token
                string authorizationHeader = Request.Headers["Authorization"];
                string token = authorizationHeader.Substring("Bearer ".Length).Trim();

                var bookingTypeRequest = await context.BookingTypes.Where(bt => bt.BookingTypeName.Contains("Service")).FirstOrDefaultAsync();
                Console.WriteLine("BookingType Id" + bookingTypeRequest.BookingTypeId);

                var bookingStatusRequest = await context.BookingStatuses.Where(bt => bt.BookingStatusName.Contains("Pending")).FirstOrDefaultAsync();
                Console.WriteLine("BookingStatus Id" + bookingTypeRequest.BookingTypeId);

                var createBookingDetail = new AddBookingDTO(bookingRequest.Customer.CusId, new Guid(bookingRequest.Customer.PaymentMethod), bookingRequest.VoucherId, bookingTypeRequest.BookingTypeId, bookingStatusRequest.BookingStatusId, Guid.Empty, bookingRequest.DiscountedPrice, bookingRequest.Customer.Note);
                var createEntity = BookingConversion.ToEntityForCreate(createBookingDetail);
                createEntity.BookingDate = bookingRequest.BookingServicesDate;
                Console.WriteLine(createEntity.ToString());
                var bookingResponse = await bookingInterface.CreateAsync(createEntity);
                if (!bookingResponse.Flag)
                {
                    return BadRequest(bookingResponse);
                }
                //Create Booking item
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    client.BaseAddress = new Uri("http://localhost:5050/api/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Call RoomHistories API for each booked room
                    foreach (var service in bookingRequest.Services)
                    {
                        var bookingServiceItemDTO = new CreateBookingServiceItemDTO
                        {
                            BookingId = createEntity.BookingId,
                            PetId = service.Pet,
                            ServiceVariantId = service.ServiceVariant,
                            Price = service.Price
                        };

                        HttpResponseMessage serviceItemResponse = await client.PostAsJsonAsync("BookingServiceItems", bookingServiceItemDTO);

                        if (!serviceItemResponse.IsSuccessStatusCode)
                        {
                            var deleteInvalidBooking = await context.Bookings.FirstOrDefaultAsync(b => b.BookingId == createEntity.BookingId);
                            context.Bookings.Remove(deleteInvalidBooking);
                            await context.SaveChangesAsync();
                            return BadRequest(new Response(false, "Fail to create a booking."));
                        }
                    }
                }
                if (bookingRequest.VoucherId != Guid.Empty)
                {
                    using (HttpClient client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                        client.BaseAddress = new Uri("http://localhost:5050/api/Voucher/");
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        if (bookingRequest.VoucherId != null && bookingRequest.VoucherId != Guid.Empty)
                        {
                            HttpResponseMessage voucherResponse = await client.PutAsync($"update-quantity/{bookingRequest.VoucherId}", null);

                            if (!voucherResponse.IsSuccessStatusCode)
                            {
                                Console.WriteLine($"Failed to update voucher quantity. Status: {voucherResponse.StatusCode}");
                                var deleteInvalidBooking = await context.Bookings.FirstOrDefaultAsync(b => b.BookingId == createEntity.BookingId);
                                context.Bookings.Remove(deleteInvalidBooking);
                                await context.SaveChangesAsync();
                                return BadRequest(new Response(false, "Fail to create a booking."));
                            }
                        }
                    }
                }
                var createdBooking = await bookingInterface.GetByIdAsync(createEntity.BookingId);

                return Ok(new Response(true, "Add booking service success") { Data = createdBooking.BookingCode });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while processing the request." });
            }
        }



        // PUT api/<BookingsController>/5
        [HttpPut("cancel/{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> CancelBooking(Guid id)
        {
            try
            {
                // Get the booking to check if it has a voucher
                var booking = await bookingInterface.GetByIdAsync(id);
                if (booking == null)
                {
                    return NotFound(new Response(false, "Booking not found"));
                }

                // Cancel the booking
                var response = await bookingInterface.CancelBookingAsync(id);
                if (!response.Flag)
                {
                    return BadRequest(response);
                }

                // Check if the booking used a voucher
                if (booking.VoucherId != Guid.Empty)
                {
                    try
                    {
                        string authorizationHeader = Request.Headers["Authorization"];
                        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
                        {
                            LogExceptions.LogToConsole("Authorization header is missing or invalid");
                            return Ok(response); // Return success for booking cancellation even if voucher refund fails
                        }

                        string token = authorizationHeader.Substring("Bearer ".Length).Trim();

                        // Make API call to refund the voucher quantity
                        using (HttpClient client = new HttpClient())
                        {
                            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                            client.BaseAddress = new Uri("http://localhost:5050/api/Voucher/");
                            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                            // Call the refund-quantity endpoint
                            HttpResponseMessage voucherResponse = await client.PutAsync($"refund-quantity/{booking.VoucherId}", null);

                            if (!voucherResponse.IsSuccessStatusCode)
                            {
                                LogExceptions.LogToConsole($"Failed to refund voucher quantity. Status: {voucherResponse.StatusCode}");
                                // We don't want to fail the booking cancellation if voucher refund fails
                                // Just log the error
                            }
                            else
                            {
                                LogExceptions.LogToConsole($"Successfully refunded voucher quantity for voucher: {booking.VoucherId}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        LogExceptions.LogToConsole($"Error refunding voucher: {ex.Message}");
                        // We don't want to fail the booking cancellation if voucher refund fails
                        // Just log the error
                    }
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                LogExceptions.LogToConsole($"Error in CancelBooking: {ex.Message}");
                return BadRequest(new Response(false, "Error processing booking cancellation"));
            }
        }



        [HttpPut("updateRoomStatus/{bookingId}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> UpdateBookingRoomStatus(Guid bookingId, [FromBody] UpdateStatusRequest request)
        {
            //token
            string authorizationHeader = Request.Headers["Authorization"];
            string token = authorizationHeader.Substring("Bearer ".Length).Trim();

            LogExceptions.LogToConsole("Token ne " + token);
            LogExceptions.LogToConsole("BookingID ne " + bookingId);
            LogExceptions.LogToConsole("Status cap nhat ne " + request.Status);



            var booking = await context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(new Response(false, "Booking not found."));

            var bookingCancel = await context.BookingStatuses.FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains("Cancelled"));

            var statusOrder = new List<string> { "Pending", "Confirmed", "Checked in", "Checked out" };
            if (!statusOrder.Contains(request.Status) || booking.BookingStatusId == bookingCancel.BookingStatusId)
                return BadRequest(new { flag = false, message = "Invalid status transition." });

            if (request.Status.Contains("Confirmed"))
            {
                var bookingStatusConfirmed = await context.BookingStatuses.FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains("Confirmed"));
                var bookingConfirmedList = await bookingInterface.GetBookingByBookingStatusAsync(bookingStatusConfirmed.BookingStatusId);
            }

            if (request.Status == "Checked in")
            {
                List<RoomHistoryDTO> roomBookingHistory;
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    client.BaseAddress = new Uri("http://localhost:5050/api/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    HttpResponseMessage roomHistoryResponse = await client.GetAsync($"RoomHistories/{booking.BookingId}");
                    if (!roomHistoryResponse.IsSuccessStatusCode)
                    {
                        return BadRequest(new Response(false, "Invalid status transition."));
                    }
                    var jsonResponse = await roomHistoryResponse.Content.ReadAsStringAsync();
                    var responseObject = JObject.Parse(jsonResponse);

                    bool flag = responseObject["flag"]?.Value<bool>() ?? false;
                    string message = responseObject["message"]?.Value<string>() ?? "No message";

                    var roomHistoryData = responseObject["data"]?.ToObject<List<RoomHistoryDTO>>();

                    if (roomHistoryData == null || !roomHistoryData.Any())
                    {
                        return BadRequest(new Response(false, "Invalid status transition."));
                    }
                    roomBookingHistory = roomHistoryData;
                }

                foreach (var room in roomBookingHistory)
                {
                    using (HttpClient client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                        client.BaseAddress = new Uri("http://localhost:5050/api/");
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        HttpResponseMessage roomResponse = await client.GetAsync($"Room/{room.roomId}");
                        if (!roomResponse.IsSuccessStatusCode)
                        {
                            return BadRequest(new Response(false, "Failed to retrieve room details."));
                        }

                        var jsonResponse = await roomResponse.Content.ReadAsStringAsync();
                        var responseObject = JObject.Parse(jsonResponse);

                        bool flag = responseObject["flag"]?.Value<bool>() ?? false;
                        if (!flag)
                        {
                            return BadRequest(new Response(false, responseObject["message"]?.Value<string>() ?? "Room not found."));
                        }

                        var roomDetail = responseObject["data"]?.ToObject<RoomDTO>();
                        if (roomDetail == null)
                        {
                            return BadRequest(new Response(false, "Invalid room data."));
                        }
                        roomDetail.status = "In use";

                        LogExceptions.LogToConsole(roomDetail.ToString());
                        var formData = new MultipartFormDataContent();
                        formData.Add(new StringContent(roomDetail.roomId.ToString()), "roomId");
                        formData.Add(new StringContent(roomDetail.roomTypeId.ToString()), "roomTypeId");
                        formData.Add(new StringContent(roomDetail.roomName), "roomName");
                        formData.Add(new StringContent(roomDetail.description ?? ""), "description");
                        formData.Add(new StringContent(roomDetail.status), "status");
                        formData.Add(new StringContent(roomDetail.hasCamera.ToString()), "hasCamera");
                        formData.Add(new StringContent(roomDetail.isDeleted.ToString()), "isDeleted");
                        HttpResponseMessage response = await client.PutAsync("Room", formData);

                        if (!response.IsSuccessStatusCode)
                        {
                            string errorResponse = await response.Content.ReadAsStringAsync();
                            LogExceptions.LogToConsole(errorResponse);
                        }
                    }
                    room.status = "Checked in";
                    room.checkInDate = DateTime.Now;
                    LogExceptions.LogToConsole(room.ToString());
                    using (HttpClient client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                        client.BaseAddress = new Uri("http://localhost:5050/api/");
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        HttpResponseMessage roomResponse = await client.PutAsJsonAsync($"RoomHistories", room);
                        if (!roomResponse.IsSuccessStatusCode)
                        {
                            var jsonResponse = await roomResponse.Content.ReadAsStringAsync();
                            LogExceptions.LogToConsole(jsonResponse);
                            return BadRequest(new Response(false, "Update room history check out date not success."));
                        }
                    }
                }
            }

            var updatedBookingStatus = await context.BookingStatuses.FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains(request.Status));
            if (updatedBookingStatus == null) return BadRequest(new { flag = false, message = "Invalid status transition." });
            if (request.Status == "Checked out")
            {
                var existPointRule = await pointRuleInterface.GetPointRuleActiveAsync();
                if (existPointRule == null)
                {
                    return BadRequest(new { flag = false, message = "Set one point rule for booking" });
                }
                var bookingPaymentType = await context.PaymentTypes.FirstOrDefaultAsync(p => p.PaymentTypeId == booking.PaymentTypeId);
                if (bookingPaymentType == null)
                {
                    return BadRequest(new { flag = false, message = "Invalid status transition." });
                }
                if (bookingPaymentType.PaymentTypeName.Contains("COD"))
                {
                    booking.isPaid = true;
                }
                //check room status 
                List<RoomHistoryDTO> roomBookingHistory;
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    client.BaseAddress = new Uri("http://localhost:5050/api/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    HttpResponseMessage roomHistoryResponse = await client.GetAsync($"RoomHistories/{booking.BookingId}");
                    if (!roomHistoryResponse.IsSuccessStatusCode)
                    {
                        return BadRequest(new Response(false, "Invalid status transition."));
                    }
                    var jsonResponse = await roomHistoryResponse.Content.ReadAsStringAsync();
                    var responseObject = JObject.Parse(jsonResponse);

                    bool flag = responseObject["flag"]?.Value<bool>() ?? false;
                    string message = responseObject["message"]?.Value<string>() ?? "No message";

                    var roomHistoryData = responseObject["data"]?.ToObject<List<RoomHistoryDTO>>();

                    if (roomHistoryData == null || !roomHistoryData.Any())
                    {
                        return BadRequest(new Response(false, "Invalid status transition."));
                    }
                    roomBookingHistory = roomHistoryData;
                }

                foreach (var room in roomBookingHistory)
                {
                    using (HttpClient client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                        client.BaseAddress = new Uri("http://localhost:5050/api/");
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        HttpResponseMessage roomResponse = await client.GetAsync($"Room/{room.roomId}");
                        if (!roomResponse.IsSuccessStatusCode)
                        {
                            return BadRequest(new Response(false, "Failed to retrieve room details."));
                        }

                        var jsonResponse = await roomResponse.Content.ReadAsStringAsync();
                        var responseObject = JObject.Parse(jsonResponse);

                        bool flag = responseObject["flag"]?.Value<bool>() ?? false;
                        if (!flag)
                        {
                            return BadRequest(new Response(false, responseObject["message"]?.Value<string>() ?? "Room not found."));
                        }

                        var roomDetail = responseObject["data"]?.ToObject<RoomDTO>();
                        if (roomDetail == null)
                        {
                            return BadRequest(new Response(false, "Invalid room data."));
                        }
                        roomDetail.status = "Free";

                        LogExceptions.LogToConsole(roomDetail.ToString());
                        var formData = new MultipartFormDataContent();
                        formData.Add(new StringContent(roomDetail.roomId.ToString()), "roomId");
                        formData.Add(new StringContent(roomDetail.roomTypeId.ToString()), "roomTypeId");
                        formData.Add(new StringContent(roomDetail.roomName), "roomName");
                        formData.Add(new StringContent(roomDetail.description ?? ""), "description");
                        formData.Add(new StringContent(roomDetail.status), "status");
                        formData.Add(new StringContent(roomDetail.hasCamera.ToString()), "hasCamera");
                        formData.Add(new StringContent(roomDetail.isDeleted.ToString()), "isDeleted");
                        HttpResponseMessage response = await client.PutAsync("Room", formData);

                        if (!response.IsSuccessStatusCode)
                        {
                            string errorResponse = await response.Content.ReadAsStringAsync();
                            LogExceptions.LogToConsole(errorResponse);
                        }
                    }
                }

                //Point rule
                using (HttpClient client = new HttpClient())
                {
                    var bookingPoint = Convert.ToInt32(booking.TotalAmount * (existPointRule.PointRuleRatio / 100.0m));

                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    var requestUrl = $"http://localhost:5050/api/Account/UpdateUserPoint?accountId={booking.AccountId}&point={bookingPoint}";

                    // Sending request to update user points
                    var pointUpdateResponse = await client.PutAsync(requestUrl, null);

                    if (!pointUpdateResponse.IsSuccessStatusCode)
                    {
                        var errorMessage = await pointUpdateResponse.Content.ReadAsStringAsync();
                        LogExceptions.LogToConsole(errorMessage);
                        return new BadRequestObjectResult(new Response(false, "Failed to update user points."));
                    }
                }
            }
            booking.BookingStatusId = updatedBookingStatus.BookingStatusId;
            context.Bookings.Update(booking);
            await context.SaveChangesAsync();
            return Ok(new Response(true, "Status updated successfully."));
        }

        [HttpPut("updateServiceStatus/{bookingId}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> UpdateBookingServiceStatus(Guid bookingId, [FromBody] UpdateStatusRequest request)
        {
            //token
            string authorizationHeader = Request.Headers["Authorization"];
            string token = authorizationHeader.Substring("Bearer ".Length).Trim();

            var booking = await context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(new Response(false, "Booking not found."));
            var bookingCancel = await context.BookingStatuses.FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains("Cancelled"));

            var statusOrder = new List<string> { "Pending", "Confirmed", "Processing", "Completed" };

            if (!statusOrder.Contains(request.Status) || booking.BookingStatusId == bookingCancel.BookingStatusId)
                return BadRequest(new { flag = false, message = "Invalid status transition." });

            var updatedBookingStatus = await context.BookingStatuses.FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains(request.Status));
            if (updatedBookingStatus == null) return BadRequest(new { flag = false, message = "Invalid status transition." });

            if (request.Status == "Completed")
            {
                var existPointRule = await pointRuleInterface.GetPointRuleActiveAsync();
                if (existPointRule == null)
                {
                    return BadRequest(new { flag = false, message = "Set one point rule for booking" });
                }

                var bookingPaymentType = await context.PaymentTypes.FirstOrDefaultAsync(p => p.PaymentTypeId == booking.PaymentTypeId);
                if (bookingPaymentType == null)
                {
                    return BadRequest(new { flag = false, message = "Invalid status transition." });
                }
                if (bookingPaymentType.PaymentTypeName.Contains("COD"))
                {
                    booking.isPaid = true;
                }
                //Point rule
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    var bookingPoint = Convert.ToInt32(booking.TotalAmount * (existPointRule.PointRuleRatio / 100.0m));

                    var requestUrl = $"http://localhost:5050/api/Account/UpdateUserPoint?accountId={booking.AccountId}&point={bookingPoint}";

                    // Sending request to update user points
                    var pointUpdateResponse = await client.PutAsync(requestUrl, null);

                    if (!pointUpdateResponse.IsSuccessStatusCode)
                    {
                        var errorMessage = await pointUpdateResponse.Content.ReadAsStringAsync();
                        LogExceptions.LogToConsole(errorMessage);
                        return new BadRequestObjectResult(new Response(false, "Failed to update user points."));
                    }
                }
            }
            booking.BookingStatusId = updatedBookingStatus.BookingStatusId;
            context.Bookings.Update(booking);
            await context.SaveChangesAsync();
            return Ok(new Response(true, "Status updated successfully."));
        }

        //[HttpGet("CreatePaymentUrl")]
        //[Authorize(Policy = "AdminOrStaffOrUser")]
        //public ActionResult<string> CreatePaymentUrl(double moneyToPay, string description)
        //{
        //    try
        //    {
        //        var ipAddress = NetworkHelper.GetIpAddress(HttpContext); // Lấy địa chỉ IP của thiết bị thực hiện giao dịch

        //        var request = new PaymentRequest
        //        {
        //            PaymentId = DateTime.Now.Ticks,
        //            Money = moneyToPay,
        //            Description = description,
        //            IpAddress = ipAddress,
        //            BankCode = BankCode.ANY, // Tùy chọn. Mặc định là tất cả phương thức giao dịch
        //            CreatedDate = DateTime.Now, // Tùy chọn. Mặc định là thời điểm hiện tại
        //            Currency = Currency.VND, // Tùy chọn. Mặc định là VND (Việt Nam đồng)
        //            Language = DisplayLanguage.Vietnamese,
        //        };
        //        var paymentUrl = vnpay.GetPaymentUrl(request);

        //        return Created(paymentUrl, paymentUrl);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}
        //[HttpGet("IpnAction")]
        //[Authorize(Policy = "AdminOrStaffOrUser")]
        //public async Task<IActionResult> IpnAction()
        //{
        //    if (Request.QueryString.HasValue)
        //    {
        //        try
        //        {
        //            var paymentResult = vnpay.GetPaymentResult(Request.Query);
        //            var descriptionJson = Request.Query["vnp_OrderInfo"].ToString();

        //            // Parse the JSON description
        //            var description = JsonConvert.DeserializeObject<dynamic>(descriptionJson);
        //            string bookingCode = description.bookingCode;
        //            string redirectPath = description.redirectPath;
        //            LogExceptions.LogToConsole(redirectPath);
        //            if (paymentResult.IsSuccess)
        //            {

        //                var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
        //                if (existingBooking == null)
        //                {
        //                    return Redirect($"http://localhost:3000{redirectPath}?status=failed");
        //                }

        //                existingBooking.isPaid = true;
        //                context.Bookings.Update(existingBooking);
        //                await context.SaveChangesAsync();
        //                // Thực hiện hành động nếu thanh toán thành công tại đây. Ví dụ: Cập nhật trạng thái đơn hàng trong cơ sở dữ liệu.
        //                return Ok();
        //            }

        //            // Thực hiện hành động nếu thanh toán thất bại tại đây. Ví dụ: Hủy đơn hàng.
        //            return BadRequest("Thanh toán thất bại");
        //        }
        //        catch (Exception ex)
        //        {
        //            return BadRequest(ex.Message);
        //        }
        //    }

        //    return NotFound("Không tìm thấy thông tin thanh toán.");
        //}

        //[HttpGet("Vnpay/Callback")]
        //[Authorize(Policy = "AdminOrStaffOrUser")]
        //public async Task<IActionResult> Callback()
        //{
        //    if (Request.QueryString.HasValue)
        //    {
        //        try
        //        {
        //            // Log all incoming query parameters
        //            foreach (var key in Request.Query.Keys)
        //            {
        //                Console.WriteLine($"{key}: {Request.Query[key]}");
        //            }

        //            var paymentResult = vnpay.GetPaymentResult(Request.Query);
        //            var descriptionJson = Request.Query["vnp_OrderInfo"].ToString();

        //            // Parse the JSON description
        //            var description = JsonConvert.DeserializeObject<dynamic>(descriptionJson);
        //            string bookingCode = description.bookingCode;
        //            string redirectPath = description.redirectPath;

        //            Console.WriteLine($"Booking Code: {bookingCode}");
        //            Console.WriteLine($"Redirect Path: {redirectPath}");
        //            Console.WriteLine($"Payment Success: {paymentResult.IsSuccess}");

        //            if (paymentResult.IsSuccess)
        //            {
        //                var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
        //                if (existingBooking == null)
        //                {
        //                    Console.WriteLine("Booking not found in database");
        //                    return Redirect($"http://localhost:3000{redirectPath}?status=failed");
        //                }

        //                Console.WriteLine($"Found booking: {existingBooking.BookingId}");

        //                // Update payment status
        //                existingBooking.isPaid = true;
        //                context.Bookings.Update(existingBooking);

        //                try
        //                {
        //                    await context.SaveChangesAsync();
        //                    Console.WriteLine("Successfully updated booking payment status");
        //                }
        //                catch (Exception ex)
        //                {
        //                    Console.WriteLine($"Error saving booking: {ex.Message}");
        //                    return Redirect($"http://localhost:3000{redirectPath}?status=dberror");
        //                }

        //                // Add delay to ensure update completes before redirect
        //                await Task.Delay(500);

        //                return Redirect($"http://localhost:3000{redirectPath}?status=success");
        //            }

        //            return Redirect($"http://localhost:3000{redirectPath}?status=failed");
        //        }
        //        catch (Exception ex)
        //        {
        //            Console.WriteLine($"Error in callback: {ex.Message}");
        //            return Redirect($"http://localhost:3000/customer/bookings?status=error");
        //        }
        //    }

        //    Console.WriteLine("No query string received");
        //    return Redirect("http://localhost:3000/customer/bookings?status=notfound");
        //}

        [HttpGet("Vnpay/Callback/update-status")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<IActionResult> CallbackVnPayToUpdatePaidStatus(string bookingCode)
        {
            try
            {
                var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
                if (existingBooking == null)
                {
                    LogExceptions.LogToConsole("Booking not found in database");
                    return BadRequest(new Response(false, "Booking not found in database!"));
                }

                LogExceptions.LogToConsole($"Found booking: {existingBooking.BookingId}");

                // Update payment status
                existingBooking.isPaid = true;
                context.Bookings.Update(existingBooking);
                await context.SaveChangesAsync();
                Console.WriteLine("Successfully updated booking payment status");

                return Ok(new Response(true, "Payment status updated successfully!"));
            }
            catch (Exception ex)
            {
                LogExceptions.LogToConsole($"Error saving booking: {ex.Message}");
                return StatusCode(500, new Response(false, "Error updating payment status"));
            }
        }

        [HttpGet("voucher/{voucher}")]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> IsReferenceInBooking(Guid voucher)
        {
            var bookings = await bookingInterface.IsReferencedInBookings(voucher);

            return Ok(bookings);
        }

        [HttpPut("addnote/{bookingId}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> AddNoteToBooking(Guid bookingId, [FromBody] string notes)
        {
            if (string.IsNullOrWhiteSpace(notes))
            {
                return BadRequest(new Response(false, "Note cannot be empty."));
            }

            var response = await bookingInterface.AddNoteToBookingAsync(bookingId, notes);

            if (response.Flag)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest(response);
            }
        }

    }
}
