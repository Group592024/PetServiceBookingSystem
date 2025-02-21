using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
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

        [HttpGet("availableRoom")]
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

        [HttpGet("petCount/{id}")]
        public async Task<ActionResult<IEnumerable<PetCountDTO>>> GetPetCount([FromRoute] Guid id)
        {
            var petCountDTOs = await _report.GetAllBookingByPet(id);
            if (!petCountDTOs.Any())
                return NotFound(new Response(false, "No pet count dtos found in the database"));

            return Ok(petCountDTOs);
        }

        [HttpGet("activeRoomType")]
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
