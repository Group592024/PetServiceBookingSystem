using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.PSBSLogs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.Intefaces;
using PSPS.SharedLibrary.Responses;

namespace ReservationApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController(IBooking bookingInterface) : ControllerBase
    {
        // GET: api/<BookingStatusController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> GetBooking()
        {
            // get all BookingStatuss from repo
            var booking = await bookingInterface.GetAllAsync();
            if (!booking.Any())
                return NotFound(new Response(false, "No Booking  detected"));
            // convert data from entity to DTO and return
            var (_, list) = BookingConversion.FromEntity(null!, booking);
            return list!.Any() ? Ok(new Response(true, "Booking  retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Booking detected"));

        }

        // GET api/<BookingStatusController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDTO>> GetBookingById(Guid id)
        {
            // get single BookingStatus from the repo
            var booking = await bookingInterface.GetByIdAsync(id);
            if (booking is null)
            {
                return NotFound(new Response(false, "Booking requested not found ne"));
            }
            // convert from entity to DTO and return
            var (_booking, _) = BookingConversion.FromEntity(booking, null!);
            LogExceptions.LogToConsole(_booking.Notes);
            return _booking is not null ? Ok(new Response(true, "The Booking  retrieved successfully") { Data = _booking })
                : NotFound(new Response(false, "Booking requested not found"));
        }

        // POST api/<BookingStatusController>
        [HttpPost]
        public async Task<ActionResult<Response>> CreateBooking([FromBody] AddBookingDTO addBookingDTO)
        {
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT
            var getEntity = BookingConversion.ToEntityForCreate(addBookingDTO);
            var response = await bookingInterface.CreateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }

        // PUT api/<BookingStatusController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Response>> UpdateBooking([FromBody] AddBookingDTO addBookingDTO)
        {


            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT         
            var getEntity = BookingConversion.ToEntityForCreate(addBookingDTO);
            var response = await bookingInterface.UpdateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
        // DELETE api/<BookingStatusController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeleteBooking(Guid id)
        {
            // convert to entity to DT
            var getEntity = await bookingInterface.GetByIdAsync(id);
            var response = await bookingInterface.DeleteAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
    }
}
