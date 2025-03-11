using FacilityServiceApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityServiceApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/bookingServiceItem")]
    [AllowAnonymous]
    public class BookingServiceItemController : Controller
    {
        private readonly FacilityServiceDbContext context;

        public BookingServiceItemController(FacilityServiceDbContext context)
        {
             this.context = context;
        }

        [HttpGet("check/{petId}")]
        public async Task<ActionResult<bool>> CheckBookingsForPet(Guid petId)
        {
            var hasBookings = await context.bookingServiceItems.AnyAsync(b => b.PetId == petId);
            return Ok(hasBookings);
        }

    }
}
