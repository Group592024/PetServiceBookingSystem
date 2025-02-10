using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportFacilityController : ControllerBase
    {
        private readonly IReport _report;

        public ReportFacilityController(IReport report)
        {
            _report = report;
        }

        [HttpGet("roomStatus")]
        public async Task<ActionResult<IEnumerable<RoomStatusDTO>>> GetRoomStatusList()
        {
            var roomStatus = await _report.GetRoomStatusList();
            if (!roomStatus.Any())
                return NotFound(new Response(false, "No room status found in the database"));

            return Ok(new Response(true, "Room status retrieved successfully")
            {
                Data = roomStatus
            });
        }

        [HttpGet("roomHistory")]
        public async Task<ActionResult<IEnumerable<RoomHistoryQuantityDTO>>> GetRoomHistory()
        {
            var roomHistory = await _report.GetRoomTypeQuantity();
            if (!roomHistory.Any())
                return NotFound(new Response(false, "No room histories found in the database"));

            return Ok(new Response(true, "Room histories retrieved successfully")
            {
                Data = roomHistory
            });
        }

        [HttpGet("bookingServiceItem")]
        public async Task<ActionResult<IEnumerable<RoomHistoryQuantityDTO>>> GetBookingServiceItem()
        {
            var roomHistory = await _report.GetServiceQuantity();
            if (!roomHistory.Any())
                return NotFound(new Response(false, "No booking service items found in the database"));

            return Ok(new Response(true, "Booking service items retrieved successfully")
            {
                Data = roomHistory
            });
        }


    }
}
