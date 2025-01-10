using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.Intefaces;
using PSPS.SharedLibrary.Responses;

namespace ReservationApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingTypeController(IBookingType bookingTypeInterface) : ControllerBase
    {
        // GET: api/<bookingTypeController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingTypeDTO>>> GetbookingTypes()
        {
            // get all bookingTypes from repo
            var bookingType = await bookingTypeInterface.GetAllAsync();
            if (!bookingType.Any())
                return NotFound(new Response(false, "No Booking Type detected"));
            // convert data from entity to DTO and return
            var (_, list) = BookingTypeConversion.FromEntity(null!, bookingType);
            return list!.Any() ? Ok(new Response(true, "Booking Type retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Booking Type detected"));

        }

        // GET api/<bookingTypeController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingTypeDTO>> GetbookingTypeById(Guid id)
        {
            // get single bookingType from the repo
            var bookingType = await bookingTypeInterface.GetByIdAsync(id);
            if (bookingType is null)
            {
                return NotFound(new Response(false, "bookingType requested not found"));
            }
            // convert from entity to DTO and return
            var (_bookingType, _) = BookingTypeConversion.FromEntity(bookingType, null!);
            return _bookingType is not null ? Ok(new Response(true, "The Booking Type retrieved successfully") { Data = _bookingType })
                : NotFound(new Response(false, "Booking Type requested not found"));
        }

        // POST api/<bookingTypeController>
        [HttpPost]
        public async Task<ActionResult<Response>> CreatebookingType([FromBody] BookingTypeDTO bookingType)
        {
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT
            var getEntity = BookingTypeConversion.ToEntity(bookingType);
            var response = await bookingTypeInterface.CreateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }

        // PUT api/<bookingTypeController>/5
        [HttpPut]
        public async Task<ActionResult<Response>> UpdatebookingType( [FromBody] BookingTypeDTO bookingType)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT         
            var getEntity = BookingTypeConversion.ToEntity(bookingType);
            var response = await bookingTypeInterface.UpdateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
        // DELETE api/<bookingTypeController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeletebookingType(Guid id)
        {
            // convert to entity to DT
            var getEntity = await bookingTypeInterface.GetByIdAsync(id);
            var response = await bookingTypeInterface.DeleteAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
    }
}