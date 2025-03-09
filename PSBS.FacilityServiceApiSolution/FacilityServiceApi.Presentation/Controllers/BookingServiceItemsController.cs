using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingServiceItemsController : ControllerBase
    {
        private readonly FacilityServiceDbContext _context;
        private readonly IBookingServiceItem bookingServiceItemInterface;
        public BookingServiceItemsController(FacilityServiceDbContext context, IBookingServiceItem _bookingServiceItemInterface)
        {
            _context = context;
            bookingServiceItemInterface = _bookingServiceItemInterface;
        }
        // GET: api/<BookingServiceItemsController>
        [HttpGet]
        [Authorize(Policy = "AdminOrStaff")]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<BookingServiceItemsController>/5
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<BookingServiceItem>> GetBookingItemByBookingId(Guid id)
        {
            var bookingItems = await _context.bookingServiceItems.Where(i => i.BookingId == id).ToListAsync();
            if (!bookingItems.Any())
            {
                return NotFound(new Response(false, "No item detected"));
            }

            return Ok(new Response(true, "Booking item retrieved successfully!")
            {
                Data = bookingItems
            });
        }

        // POST api/<BookingServiceItemsController>
        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreateServiceItem([FromBody] CreateBookingServiceItemDTO createBookingServiceItem)
        {

            var createEntity = BookingServiceItemConversion.ToEntityForCreate(createBookingServiceItem);
            var response = await bookingServiceItemInterface.CreateAsync(createEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // PUT api/<BookingServiceItemsController>/5
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<BookingServiceItemsController>/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public void Delete(int id)
        {
        }
    }
}
