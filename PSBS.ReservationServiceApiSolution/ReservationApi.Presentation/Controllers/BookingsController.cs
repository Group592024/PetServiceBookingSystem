
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
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
        public async Task<ActionResult<Response>> CreateBookingRoom([FromBody] BookingRoomRequestDTO bookingRequest)
        {
            try
            {
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
                var bookingTypeRequest = await context.BookingTypes.Where(bt => bt.BookingTypeName.Contains("Hotel")).FirstOrDefaultAsync();
                Console.WriteLine("BookingType Id" + bookingTypeRequest.BookingTypeId);

                var bookingStatusRequest = await context.BookingStatuses.Where(bt => bt.BookingStatusName.Contains("Pending")).FirstOrDefaultAsync();
                Console.WriteLine("BookingStatus Id" + bookingTypeRequest.BookingTypeId);

                var createBookingDetail = new AddBookingDTO(bookingRequest.Customer.CusId, new Guid(bookingRequest.Customer.PaymentMethod), bookingRequest.VoucherId, bookingTypeRequest.BookingTypeId, bookingStatusRequest.BookingStatusId, Guid.Empty, bookingRequest.DiscountedPrice, bookingRequest.Customer.Note);
                var createEntity = BookingConversion.ToEntityForCreate(createBookingDetail);
                Console.WriteLine(createEntity.ToString());
                var bookingResponse = await bookingInterface.CreateAsync(createEntity);
                if (!bookingResponse.Flag)
                {
                    return BadRequest(bookingResponse);
                }
                //Create Room History
                using (HttpClient client = new HttpClient())
                {
                    client.BaseAddress = new Uri("http://localhost:5023/api/");
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
                        client.BaseAddress = new Uri("http://localhost:5022/api/Voucher/");
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
                    client.BaseAddress = new Uri("http://localhost:5023/api/");
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
                        client.BaseAddress = new Uri("http://localhost:5022/api/Voucher/");
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
        public async Task<ActionResult<Response>> CancelBooking(Guid id)
        {
            var response = await bookingInterface.CancelBookingAsync(id);
            return response.Flag ? Ok(response) : BadRequest(response);

        }


        [HttpPut("updateRoomStatus/{bookingId}")]
        public async Task<IActionResult> UpdateBookingRoomStatus(Guid bookingId, [FromBody] UpdateStatusRequest request)
        {
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
                List<RoomHistoryDTO> roomHistoryDTOs;
                using (HttpClient client = new HttpClient())
                {
                    client.BaseAddress = new Uri("http://localhost:5023/api/");
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
                    roomHistoryDTOs = roomHistoryData;
                }
                foreach (var room in roomHistoryDTOs)
                {
                    foreach (var bookingroom in bookingConfirmedList)
                    {
                        List<RoomHistoryDTO> bookingroomDetail;
                        using (HttpClient client = new HttpClient())
                        {
                            client.BaseAddress = new Uri("http://localhost:5023/api/");
                            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                            HttpResponseMessage roomHistoryResponse = await client.GetAsync($"RoomHistories/{bookingroom.BookingId}");
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
                                return BadRequest(new { flag = false, message = "Invalid status transition." });
                            }
                            bookingroomDetail = roomHistoryData;
                        }
                        foreach (var roomHistory in bookingroomDetail)
                        {
                            if(room.bookingStartDate >= roomHistory.bookingStartDate && room.bookingEndDate <= roomHistory.bookingEndDate)
                            {
                                return BadRequest(new { flag = false, message = "The system has a booking in this time." });
                            }
                            if (room.bookingStartDate <= roomHistory.bookingStartDate && room.bookingEndDate >= roomHistory.bookingStartDate)
                            {
                                return BadRequest(new { flag = false, message = "The system has a booking in this time." });
                            }
                            if (room.bookingStartDate >= roomHistory.bookingStartDate && room.bookingStartDate <= roomHistory.bookingEndDate)
                            {
                                return BadRequest(new { flag = false, message = "The system has a booking in this time." });
                            }
                        }
                    }
                }
            }

            if(request.Status == "Checked in")
            {
                List<RoomHistoryDTO> roomBookingHistory;
                using (HttpClient client = new HttpClient())
                {
                    client.BaseAddress = new Uri("http://localhost:5023/api/");
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
                        client.BaseAddress = new Uri("http://localhost:5023/api/");
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
                }
            }

            var updatedBookingStatus = await context.BookingStatuses.FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains(request.Status));
            if (updatedBookingStatus == null) return BadRequest(new { flag = false, message = "Invalid status transition." });
            if (request.Status == "Checked out")
            {
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
                    client.BaseAddress = new Uri("http://localhost:5023/api/");
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
                        client.BaseAddress = new Uri("http://localhost:5023/api/");
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
                //HttpClient _httpClient = new HttpClient();
                //var bookingPoint = Convert.ToInt32(booking.TotalAmount * 0.01m);
                //PointRuleDTO pointRule = new PointRuleDTO(Guid.Empty, bookingPoint,false);
                //var apiUrl = "http://localhost:5115/api/PointRule";
                //var pointResponse = await _httpClient.PostAsJsonAsync(apiUrl, pointRule);

                //var result = await pointResponse.Content.ReadFromJsonAsync<Response>();

                //LogExceptions.LogToConsole($"API Response: {JsonConvert.SerializeObject(result)}");

                //if (result?.Data == null)
                //{
                //    LogExceptions.LogToConsole("Point Rule creation returned null Data.");
                //    return BadRequest("Point Rule creation failed.");
                //}
                //LogExceptions.LogToConsole($"API Response: {JsonConvert.SerializeObject(result.Data)}");

            }
            booking.BookingStatusId = updatedBookingStatus.BookingStatusId;
            context.Bookings.Update(booking);
            await context.SaveChangesAsync();
            return Ok(new Response(true, "Status updated successfully."));
        }

        [HttpPut("updateServiceStatus/{bookingId}")]
        public async Task<IActionResult> UpdateBookingServiceStatus(Guid bookingId, [FromBody] UpdateStatusRequest request)
        {
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
                var bookingPaymentType = await context.PaymentTypes.FirstOrDefaultAsync(p => p.PaymentTypeId == booking.PaymentTypeId);
                if (bookingPaymentType == null)
                {
                    return BadRequest(new { flag = false, message = "Invalid status transition." });
                }
                if (bookingPaymentType.PaymentTypeName.Contains("COD"))
                {
                    booking.isPaid = true;
                }
            }
            booking.BookingStatusId = updatedBookingStatus.BookingStatusId;
            context.Bookings.Update(booking);
            await context.SaveChangesAsync();
            return Ok(new Response(true, "Status updated successfully."));
        }

        [HttpGet("CreatePaymentUrl")]
        public ActionResult<string> CreatePaymentUrl(double moneyToPay, string description)
        {
            try
            {
                var ipAddress = NetworkHelper.GetIpAddress(HttpContext); // Lấy địa chỉ IP của thiết bị thực hiện giao dịch

                var request = new PaymentRequest
                {
                    PaymentId = DateTime.Now.Ticks,
                    Money = moneyToPay,
                    Description = description,
                    IpAddress = ipAddress,
                    BankCode = BankCode.ANY, // Tùy chọn. Mặc định là tất cả phương thức giao dịch
                    CreatedDate = DateTime.Now, // Tùy chọn. Mặc định là thời điểm hiện tại
                    Currency = Currency.VND, // Tùy chọn. Mặc định là VND (Việt Nam đồng)
                    Language = DisplayLanguage.Vietnamese // Tùy chọn. Mặc định là tiếng Việt
                };
                var paymentUrl = vnpay.GetPaymentUrl(request);

                return Created(paymentUrl, paymentUrl);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("IpnAction")]
        public IActionResult IpnAction()
        {
            if (Request.QueryString.HasValue)
            {
                try
                {
                    var paymentResult = vnpay.GetPaymentResult(Request.Query);
                    if (paymentResult.IsSuccess)
                    {
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
        public async Task<IActionResult> Callback()
        {
            if (Request.QueryString.HasValue)
            {
                try
                {
                    var paymentResult = vnpay.GetPaymentResult(Request.Query);
                    foreach (var key in Request.Query.Keys)
                    {
                        LogExceptions.LogToConsole($"{key}: {Request.Query[key]}");
                    }
                    var resultDescription = paymentResult.PaymentResponse.Description;
                    // var resultDescription = $"{paymentResult.PaymentResponse.Description}. {paymentResult.TransactionStatus.Description}.";
                    var bookingCode = Request.Query["vnp_OrderInfo"];
                    if (paymentResult.IsSuccess)
                    {
                        LogExceptions.LogToConsole("bookingCode " + bookingCode);
                        Console.WriteLine("bookingCode " + bookingCode);
                        var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
                        if (existingBooking == null)
                        {
                            return Redirect("http://localhost:3000/bookings?status=failed");
                        }
                        LogExceptions.LogToConsole("booking" + existingBooking.BookingId);
                        Console.WriteLine("qua day roi");
                        existingBooking.isPaid = true;
                        context.Bookings.Update(existingBooking);
                        await context.SaveChangesAsync();
                        LogExceptions.LogToConsole("payment" + existingBooking.isPaid);
                        Console.WriteLine("qua day nuaaaaaaaaaaaaaaaaaaa roi");
                        return Redirect("http://localhost:3000/bookings?status=success");
                    }

                    return Redirect("http://localhost:3000/bookings?status=failed"); 
                }
                catch (Exception ex)
                {
                    return Redirect("http://localhost:3000/bookings?status=error");
                }
            }

            return Redirect("http://localhost:3000/bookings?status=notfound");
        }

        [HttpGet("Vnpay/Callback/admin")]
        public async Task<IActionResult> CallbackVnPayForAdmin()
        {
            if (Request.QueryString.HasValue)
            {
                try
                {
                    var paymentResult = vnpay.GetPaymentResult(Request.Query);
                    foreach (var key in Request.Query.Keys)
                    {
                        LogExceptions.LogToConsole($"{key}: {Request.Query[key]}");
                    }
                    var resultDescription = paymentResult.PaymentResponse.Description;
                    // var resultDescription = $"{paymentResult.PaymentResponse.Description}. {paymentResult.TransactionStatus.Description}.";
                    var bookingCode = Request.Query["vnp_OrderInfo"];
                    if (paymentResult.IsSuccess)
                    {
                        LogExceptions.LogToConsole("bookingCode " + bookingCode);
                        Console.WriteLine("bookingCode " + bookingCode);
                        var existingBooking = await bookingInterface.GetBookingByBookingCodeAsync(bookingCode);
                        if (existingBooking == null)
                        {
                            return Redirect("http://localhost:3000/bookings?status=failed");
                        }
                        LogExceptions.LogToConsole("booking" + existingBooking.BookingId);
                        Console.WriteLine("qua day roi");
                        existingBooking.isPaid = true;
                        context.Bookings.Update(existingBooking);
                        await context.SaveChangesAsync();
                        LogExceptions.LogToConsole("payment" + existingBooking.isPaid);
                        Console.WriteLine("qua day nuaaaaaaaaaaaaaaaaaaa roi");
                        return Redirect("http://localhost:3000/admin/bookings?status=success");
                    }

                    return Redirect("http://localhost:3000/admin/bookings?status=failed");
                }
                catch (Exception ex)
                {
                    return Redirect("http://localhost:3000/admin/bookings?status=error");
                }
            }

            return Redirect("http://localhost:3000/admin/bookings?status=notfound");
        }
    }
}
