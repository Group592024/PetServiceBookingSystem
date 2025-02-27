using Microsoft.AspNetCore.Mvc;
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

            return bookingStatus!.Any() ? Ok(new Response(true, "Booking Status retrieved successfully!")
            {
                Data = bookingStatus
            }) : NotFound(new Response(false, "No Booking Status detected"));

        }

    }
}
