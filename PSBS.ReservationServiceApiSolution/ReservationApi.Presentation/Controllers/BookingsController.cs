
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Presentation.Services.VNPay;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ReservationApi.Presentation.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BookingsController(IBooking bookingInterface, ReservationServiceDBContext context, IVnPayService _vnPayService) : ControllerBase
    {
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

                var createBookingDetail = new AddBookingDTO(bookingRequest.Customer.CusId, new Guid (bookingRequest.Customer.PaymentMethod), bookingRequest.VoucherId, bookingTypeRequest.BookingTypeId, bookingStatusRequest.BookingStatusId, Guid.Empty, bookingRequest.DiscountedPrice, bookingRequest.Customer.Note);
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
                            return BadRequest(new Response(false , "Fail to create a booking."));
                        }
                    }
                }
                if(bookingRequest.VoucherId != Guid.Empty)
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

        [HttpPost("VNPay")]
        public async Task<ActionResult<Response>> CreateVNPayPayment([FromBody] VNPayRequestDTO request)
        {
            if (request == null)
            {
                return BadRequest(new Response(false, "Invalid request data"));
            }

            var url = _vnPayService.CreatePaymentUrl(request, HttpContext);
            Console.WriteLine("VNPay Request Data: " + JsonConvert.SerializeObject(request, Formatting.Indented));

            if (string.IsNullOrEmpty(url))
            {
                return BadRequest(new Response(false, "VNPay URL generation failed"));
            }
            Console.WriteLine("Generated VNPay URL: " + url);
            return new Response(true, "VNPay") { Data = url };
        }

        [HttpGet("VNPayReturn")]
        public async Task<ActionResult<Response>> VNPayReturn()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);

            return new Response(true, "VNPay") { Data = response };

        }


    }
}
