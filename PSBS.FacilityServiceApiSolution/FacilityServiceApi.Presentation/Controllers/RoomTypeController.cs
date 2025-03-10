using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoomTypeController : ControllerBase
    {
        private readonly IRoomType _roomType;

        public RoomTypeController(IRoomType roomTypeService)
        {
            _roomType = roomTypeService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<RoomTypeDTO>>> GetRoomTypes()
        {
            var roomTypes = await _roomType.GetAllAsync();
            if (!roomTypes.Any())
                return NotFound(new Response(false, "No room types found in the database"));

            //var roomTypeDtos = roomTypes.Select(roomType => new RoomTypeDTO
            //{
            //    roomTypeId = roomType.roomTypeId,
            //    name = roomType.name,
            //    price = roomType.price,
            //    description = roomType.description,
            //    isDeleted = roomType.isDeleted
            //});

            var (_, roomTypeResponse) = RoomTypeConversion.FromEntity(null, roomTypes);

            return Ok(new Response(true, "Room types retrieved successfully")
            {
                Data = roomTypeResponse
            });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<RoomTypeDTO>> GetRoomTypeById(Guid id)
        {
            var roomType = await _roomType.GetByIdAsync(id);
            if (roomType == null)
            {
                return NotFound(new Response(false, $"RoomType with ID {id} not found"));
            }

            var roomTypeDto = new RoomTypeDTO
            {
                roomTypeId = roomType.roomTypeId,
                name = roomType.name,
                price = roomType.price,
                description = roomType.description,
                isDeleted = roomType.isDeleted
            };

            return Ok(new Response(true, "RoomType retrieved successfully")
            {
                Data = roomTypeDto
            });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreateRoomType([FromBody] RoomTypeDTO creatingRoomType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = "Invalid input data" });
            }

            var newRoomTypeEntity = RoomTypeConversion.ToEntity(creatingRoomType);
            var response = await _roomType.CreateAsync(newRoomTypeEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdateRoomType([FromBody] RoomTypeDTO updatingRoomType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var existingRoomType = await _roomType.GetByIdAsync(updatingRoomType.roomTypeId);
            if (existingRoomType == null)
            {
                return NotFound(new Response(false, $"RoomType with ID {updatingRoomType.roomTypeId} not found"));
            }

            var updatedRoomTypeEntity = RoomTypeConversion.ToEntity(updatingRoomType);
            var response = await _roomType.UpdateAsync(updatedRoomTypeEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeleteRoomType(Guid id)
        {
            var existingRoomType = await _roomType.GetByIdAsync(id);
            if (existingRoomType == null)
            {
                return NotFound(new Response(false, $"RoomType with ID {id} not found or already deleted"));
            }

            var response = await _roomType.DeleteAsync(existingRoomType);

            return response.Flag
                ? Ok(response)
                : BadRequest(response);
        }

        [HttpGet("available")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<RoomTypeDTO>>> GetAvailableRoomTypes()
        {
            var roomtypes = await _roomType.ListAvailableRoomTypeAsync();
            if (!roomtypes.Any())
            {
                return NotFound(new Response(false, "No available rooms found"));
            }

            var (_, roomTypeDtos) = RoomTypeConversion.FromEntity(null!, roomtypes);
            return Ok(new Response(true, "Available rooms retrieved successfully")
            {
                Data = roomTypeDtos
            });
        }
    }
}