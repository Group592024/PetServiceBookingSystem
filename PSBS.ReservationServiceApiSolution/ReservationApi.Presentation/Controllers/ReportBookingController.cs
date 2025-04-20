using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;

namespace ReservationApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ReportBookingController(IBookingStatus bookingStatusInterface,
            IReport reportInterface) : ControllerBase
    {
        [HttpGet("paid")]
        public async Task<ActionResult<PaidBookingIdsDTO>> GetPaidBookingIds([FromQuery] int? year, [FromQuery] int? month, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var petCountDTOs = await reportInterface.GetPaidBookingIds(year, month, startDate, endDate);
            if (petCountDTOs.BookingIds.IsNullOrEmpty())
                return NotFound(new Response(false, "No booking found in the database"));

            return Ok(petCountDTOs);
        }


        [HttpGet("accountAmount")]
        public async Task<ActionResult<IEnumerable<ReportBookingTypeDTO>>> GetIncomeEachCustomer(int? year,
            int? month, DateTime? startDate, DateTime? endDate)
        {
            // get all BookingStatuss from repo
            var bookings = await reportInterface.GetIncomeEachCustomer(year, month, startDate, endDate);
            if (!bookings.Any())
                return NotFound(new Response(false, "No bookings detected"));
            // convert data from entity to DTO and return

            return bookings!.Any() ? Ok(new Response(true, "Booking retrieved successfully!")
            {
                Data = bookings
            }) : NotFound(new Response(false, "No Booking detected"));

        }

        [HttpGet("bookingStatus")]
        public async Task<ActionResult<IEnumerable<BookingStatusDTO>>> GetBookingStatuses()
        {
            // get all BookingStatuss from repo
            var bookingStatus = await reportInterface.GetAllBookingStatusIncludeBookingAsync();
            if (!bookingStatus.Any())
                return NotFound(new Response(false, "No Booking Status detected"));
            // convert data from entity to DTO and return
            var (_, list) = ReportBookingConversion.FromEntity(null, bookingStatus);
            return list!.Any() ? Ok(new Response(true, "Booking Status retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Booking Status detected"));

        }

        [HttpGet("getIncome")]
        public async Task<ActionResult<IEnumerable<ReportBookingTypeDTO>>> GetIncome(int? year,
            int? month, DateTime? startDate, DateTime? endDate)
        {
            // get all BookingStatuss from repo
            var bookingStatus = await reportInterface.GetTotalIncomeByBookingTypeAsync(year, month, startDate, endDate);
            if (!bookingStatus.Any())
                return NotFound(new Response(false, "No Booking type detected"));
            // convert data from entity to DTO and return

            return bookingStatus!.Any() ? Ok(new Response(true, "Booking type retrieved successfully!")
            {
                Data = bookingStatus
            }) : NotFound(new Response(false, "No Booking type detected"));

        }

    }
}
