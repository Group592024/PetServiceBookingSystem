using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly IRoom _room;
        private readonly IRoomType _roomType;

        public RoomController(IRoom roomService, IRoomType roomTypeService)
        {
            _room = roomService;
            _roomType = roomTypeService;
        }

        [HttpGet("roomtypes")]
        public async Task<ActionResult<IEnumerable<RoomTypeDTO>>> GetRoomTypes()
        {
            var roomTypes = await _roomType.GetAllAsync();
            if (!roomTypes.Any())
                return NotFound("No room types found in the database");

            var roomTypeDtos = roomTypes.Select(roomType => new RoomTypeDTO
            {
                roomTypeId = roomType.roomTypeId,
                name = roomType.name,
                pricePerHour = roomType.pricePerHour,
                pricePerDay = roomType.pricePerDay,
                description = roomType.description
            });

            return Ok(roomTypeDtos);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetRoomsList()
        {
            var rooms = (await _room.GetAllAsync())
                        .Where(r => !r.isDeleted) 
                        .ToList();
            if (!rooms.Any())
            {
                return NotFound(new Response(false, "No rooms found in the database"));
            }

            var (_, roomDtos) = RoomConversion.FromEntity(null!, rooms);
            return Ok(new Response(true, "Rooms retrieved successfully")
            {
                Data = roomDtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDTO>> GetRoomById(Guid id)
        {
            var room = await _room.GetByIdAsync(id);
            if (room == null || room.isDeleted)
            {
                return NotFound(new Response(false, $"Room with GUID {id} not found or is deleted"));
            }

            var (roomDto, _) = RoomConversion.FromEntity(room, null!);
            return Ok(new Response(true, "Room retrieved successfully")
            {
                Data = roomDto
            });
        }

        [HttpPost]
        public async Task<ActionResult<Response>> CreateRoom([FromForm] RoomDTO creatingRoom, IFormFile? imageFile)
        {
            ModelState.Remove(nameof(RoomDTO.roomId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var roomType = await _roomType.GetByIdAsync(creatingRoom.roomTypeId);
            if (roomType == null)
            {
                return NotFound(new Response(false, $"RoomType with ID {creatingRoom.roomTypeId} not found"));
            }
            string imagePath = await HandleImageUpload(imageFile) ?? "default_image.jpg";
            var newRoomEntity = RoomConversion.ToEntity(creatingRoom with { roomImage = imagePath });
            var response = await _room.CreateAsync(newRoomEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        public async Task<ActionResult<Response>> UpdateRoom([FromForm] RoomDTO updatingRoom, IFormFile? imageFile = null)
        {
            ModelState.Remove(nameof(RoomDTO.roomId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var existingRoom = await _room.GetByIdAsync(updatingRoom.roomId);
            if (existingRoom == null || existingRoom.isDeleted)
            {
                return NotFound(new Response(false, $"Room with ID {updatingRoom.roomId} not found or is deleted"));
            }
            string? imagePath = imageFile != null
                ? await HandleImageUpload(imageFile, existingRoom.roomImage)
                : existingRoom.roomImage;

            var updatedRoom = RoomConversion.ToEntity(updatingRoom with { roomImage = imagePath });
            var response = await _room.UpdateAsync(updatedRoom);

            return response.Flag ? Ok(response) : BadRequest(new Response(false, "Failed to update the room"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeleteRoom(Guid id)
        {
            var existingRoom = await _room.GetByIdAsync(id);
            if (existingRoom == null || existingRoom.isDeleted)
            {
                return NotFound(new Response(false, $"Room with GUID {id} not found or already deleted"));
            }

            // Mark the room as deleted (soft delete)
            var response = await _room.DeleteAsync(existingRoom);

            return response.Flag
                ? Ok(new Response(true, "Room deleted successfully"))
                : BadRequest(new Response(false, "Failed to delete the room"));
        }

        private async Task<string?> HandleImageUpload(IFormFile? imageFile, string? oldImagePath = null)
        {
            if (imageFile == null || imageFile.Length == 0)
                return null;

            if (!string.IsNullOrEmpty(oldImagePath))
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), oldImagePath.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            var fileName = Guid.NewGuid() + Path.GetExtension(imageFile.FileName);
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Images");
            var fullPath = Path.Combine(folderPath, fileName);

            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            return $"/Images/{fileName}";
        }
    }
}
