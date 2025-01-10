using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.Intefaces;
using PSPS.SharedLibrary.Responses;
using PSPS.SharedLibrary.PSBSLogs;

namespace ReservationApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingStatusController(IBookingStatus bookingStatusInterface) : ControllerBase { 
        // GET: api/<BookingStatusController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingStatusDTO>>> GetBookingStatuses()
    {
        // get all BookingStatuss from repo
        var bookingStatus = await bookingStatusInterface.GetAllAsync();
        if (!bookingStatus.Any())
            return NotFound(new Response(false, "No Booking Status detected"));
            // convert data from entity to DTO and return
            var (_, list) = BookingStatusConversion.FromEntity(null!, bookingStatus);
        return list!.Any() ? Ok(new Response(true, "Booking Status retrieved successfully!")
        {
            Data = list
        }) : NotFound(new Response(false, "No Booking Status detected"));

    }

    // GET api/<BookingStatusController>/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingStatusDTO>> GetBookingStatusById(Guid id)
    {
        // get single BookingStatus from the repo
        var bookingStatus = await bookingStatusInterface.GetByIdAsync(id);
        if (bookingStatus is null)
        {
            return NotFound(new Response(false, "BookingStatus requested not found ne"));
        }
        // convert from entity to DTO and return
        var (_bookingStatus, _) = BookingStatusConversion.FromEntity(bookingStatus, null!);
            LogExceptions.LogToConsole(_bookingStatus.BookingStatusName);
        return _bookingStatus is not null ? Ok(new Response(true, "The Booking Status retrieved successfully") { Data = _bookingStatus })
            : NotFound(new Response(false, "Booking Status requested not found"));
    }

    // POST api/<BookingStatusController>
    [HttpPost]
    public async Task<ActionResult<Response>> CreateBookingStatus([FromBody] BookingStatusDTO bookingStatus)
    {
        // CHECK model state is all data annotations are passed
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        // convert to entity to DT
        var getEntity = BookingStatusConversion.ToEntity(bookingStatus);
        var response = await bookingStatusInterface.CreateAsync(getEntity);
        return response.Flag is true ? Ok(response) : BadRequest(response);
    }

    // PUT api/<BookingStatusController>/5
    [HttpPut]
    public async Task<ActionResult<Response>> UpdateBookingStatus( [FromBody] BookingStatusDTO bookingStatus)
    {
   
      
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        // convert to entity to DT         
        var getEntity = BookingStatusConversion.ToEntity(bookingStatus);
        var response = await bookingStatusInterface.UpdateAsync(getEntity);
        return response.Flag is true ? Ok(response) : BadRequest(response);
    }
    // DELETE api/<BookingStatusController>/5
    [HttpDelete("{id}")]
    public async Task<ActionResult<Response>> DeleteBookingStatus(Guid id)
    {
        // convert to entity to DT
        var getEntity = await bookingStatusInterface.GetByIdAsync(id);
        var response = await bookingStatusInterface.DeleteAsync(getEntity);
        return response.Flag is true ? Ok(response) : BadRequest(response);
    }
}
}