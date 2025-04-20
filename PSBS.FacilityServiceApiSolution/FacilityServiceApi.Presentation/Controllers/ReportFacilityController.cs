using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportFacilityController : ControllerBase
    {
        private readonly IReport _report;
        private readonly ReservationApiClient _reservationApiClient;

        public ReportFacilityController(IReport report, ReservationApiClient reservationApiClient)
        {
            _report = report;
            _reservationApiClient = reservationApiClient;
        }

        [HttpGet("availableRoom")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetAvailableRooms()
        {
            var rooms = await _report.ListActiveRoomsAsync();
            if (!rooms.Any())
            {
                return NotFound(new Response(false, "No available rooms found"));
            }

            var (_, roomDtos) = RoomConversion.FromEntity(null!, rooms);
            return Ok(new Response(true, "Available rooms retrieved successfully")
            {
                Data = roomDtos
            });
        }

        [HttpGet("roomStatus")]
        [Authorize(Policy = "AdminOrStaff")]
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
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<RoomHistoryQuantityDTO>>> GetRoomHistory(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var roomHistory = await _report.GetRoomTypeQuantity(year, month, startDate, endDate);
            if (!roomHistory.Any())
                return NotFound(new Response(false, "No room histories found in the database"));

            return Ok(new Response(true, "Room histories retrieved successfully")
            {
                Data = roomHistory
            });
        }

        [HttpGet("bookingServiceItem")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<RoomHistoryQuantityDTO>>> GetBookingServiceItem(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var authString = HttpContext.Request.Headers["Authorization"].ToString();

            var auth = authString.Substring(7);
            Console.WriteLine("token nef: " + auth);
            Console.WriteLine("co do day nho");
            var response = await _reservationApiClient.GetPaidBookingIds(authString, year, month, startDate, endDate);
            if (response is null)
            {
                return NotFound(new Response(false, "No booking found"));
            }
            Console.WriteLine("response day nay" + response.Count());


            var result = await _report.GetServiceQuantity(response);

            Console.WriteLine("sau khi goi petbreed: " + result.ToString());

            if (result is null)
            {
                return NotFound(new Response(false, "No booking found"));
            }

            return Ok(new Response(true, "Booking found successfully")
            {
                Data = result
            });
        }

        [HttpGet("petCount/{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<PetCountDTO>>> GetPetCount([FromRoute] Guid id,
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var petCountDTOs = await _report.GetAllBookingByPet(id, year, month, startDate, endDate);
            if (!petCountDTOs.Any())
                return NotFound(new Response(false, "No pet count dtos found in the database"));

            return Ok(petCountDTOs);
        }

        [HttpGet("activeRoomType")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<RoomHistoryQuantityDTO>>> GetActiveRoomTypes()
        {
            var roomStatus = await _report.GetActiveRoomTypeList();
            if (!roomStatus.Any())
                return NotFound(new Response(false, "No room type found in the database"));

            return Ok(new Response(true, "Room type retrieved successfully")
            {
                Data = roomStatus
            });
        }

        [HttpGet("activeServiceType")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<RoomHistoryQuantityDTO>>> GetActiveServiceTypes()
        {
            var roomStatus = await _report.GetActiveServiceTypeList();
            if (!roomStatus.Any())
                return NotFound(new Response(false, "No service type found in the database"));

            return Ok(new Response(true, "Service type retrieved successfully")
            {
                Data = roomStatus
            });
        }

    }
}
