using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingServiceItemsController : ControllerBase
    {
        private readonly FacilityServiceDbContext _context;
        public BookingServiceItemsController(FacilityServiceDbContext context)
        {
            _context = context;
        }
        // GET: api/<BookingServiceItemsController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<BookingServiceItemsController>/5
        [HttpGet("{id}")]
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
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<BookingServiceItemsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<BookingServiceItemsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
