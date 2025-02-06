using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;
using static System.Runtime.InteropServices.JavaScript.JSType;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ReservationApi.Presentation.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BookingsController(IBooking bookingInterface) : ControllerBase
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
            var getEntity = BookingConversion.ToEntity(addBookingDTO);
            var response = await bookingInterface.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // PUT api/<BookingsController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Response>> Put(int id, [FromBody] string value)
        {
            return Ok(value);
        }

        // DELETE api/<BookingsController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> Delete(int id)
        {
            return Ok();
        }
    }
}
