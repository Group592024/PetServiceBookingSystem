using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using System.Collections.Generic;

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
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetRooms()
        {
            var rooms = await _room.GetAllAsync();
            if (!rooms.Any())
                return NotFound("No rooms found in the database");

            var roomDtos = rooms.Select(room => new RoomDTO
            {
                roomId = room.roomId,
                roomTypeId = room.roomTypeId,
                description = room.description,
                status = room.status,
                isDeleted = room.isDeleted,
                roomImage = room.roomImage,
                hasCamera = room.hasCamera
            });

            return Ok(roomDtos);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<RoomDTO>> GetRoom(Guid id)
        {
            var room = await _room.GetByIdAsync(id);
            if (room == null)
                return NotFound($"Room with GUID {id} not found");

            return Ok(new RoomDTO
            {
                roomId = room.roomId,
                roomTypeId = room.roomTypeId,
                description = room.description,
                status = room.status,
                isDeleted = room.isDeleted,
                roomImage = room.roomImage,
                hasCamera = room.hasCamera
            });
        }

        [HttpPost]
        public async Task<ActionResult<Response>> CreateRoom([FromForm] RoomDTO roomDto, IFormFile? imageFile)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var roomType = await _roomType.GetByIdAsync(roomDto.roomTypeId);
            if (roomType == null)
                return NotFound($"RoomType with ID {roomDto.roomTypeId} not found");

            var roomId = roomDto.roomId ?? Guid.NewGuid();

            var imagePath = await HandleImageUpload(imageFile) ?? "default_image.jpg";
            bool isDeleted = roomDto.isDeleted ?? false;

            var room = new Room
            {
                roomId = roomId,
                roomTypeId = roomDto.roomTypeId,
                description = roomDto.description,
                status = roomDto.status,
                isDeleted = isDeleted,
                roomImage = imagePath,
                hasCamera = roomDto.hasCamera
            };

            var response = await _room.CreateAsync(room);

            if (response.Flag)
            {
                return Ok(response); 
            }

            return BadRequest(response); 
        }

        [HttpPut]
        public async Task<ActionResult<Response>> UpdateRoom([FromForm] RoomDTO roomDto, IFormFile? imageFile = null)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (roomDto.roomId == null || roomDto.roomId == Guid.Empty)
            {
                return BadRequest("Invalid or missing roomId.");
            }

            var existingRoom = await _room.GetByIdAsync(roomDto.roomId.Value);
            if (existingRoom == null)
                return NotFound($"Room with ID {roomDto.roomId} not found");

            var roomType = await _roomType.GetByIdAsync(roomDto.roomTypeId);
            if (roomType == null)
                return NotFound($"RoomType with ID {roomDto.roomTypeId} not found");

            string? imagePath = existingRoom.roomImage;
            if (imageFile != null)
            {
                imagePath = await HandleImageUpload(imageFile, existingRoom.roomImage);
            }

            existingRoom.roomTypeId = roomDto.roomTypeId;
            existingRoom.description = roomDto.description;
            existingRoom.status = roomDto.status;
            existingRoom.roomImage = imagePath;
            existingRoom.hasCamera = roomDto.hasCamera;

            var response = await _room.UpdateAsync(existingRoom);

            if (response.Flag)
            {
                var updatedRoomDto = new RoomDTO
                {
                    roomId = existingRoom.roomId,
                    roomTypeId = existingRoom.roomTypeId,
                    description = existingRoom.description,
                    status = existingRoom.status,
                    isDeleted = existingRoom.isDeleted,
                    roomImage = existingRoom.roomImage,
                    hasCamera = existingRoom.hasCamera
                };

                return Ok(updatedRoomDto);
            }

            return BadRequest(response);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Response>> DeleteRoom(Guid id)
        {
            var existingRoom = await _room.GetByIdAsync(id);
            if (existingRoom == null)
                return NotFound($"Room with GUID {id} not found");

            var response = await _room.DeleteAsync(existingRoom);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        private async Task<string?> HandleImageUpload(IFormFile imageFile, string? existingImagePath = null)
        {
            try
            {
                if (imageFile != null && imageFile.Length > 0)
                {
                    var imagesDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Images");
                    if (!Directory.Exists(imagesDirectory))
                        Directory.CreateDirectory(imagesDirectory);

                    var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                    var imagePath = Path.Combine(imagesDirectory, uniqueFileName);

                    // Delete Old Image
                    if (!string.IsNullOrEmpty(existingImagePath))
                    {
                        var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), existingImagePath.TrimStart('/'));
                        if (System.IO.File.Exists(oldImagePath))
                            System.IO.File.Delete(oldImagePath);
                    }

                    using (var stream = new FileStream(imagePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(stream);
                    }

                    return $"/Images/{uniqueFileName}";
                }
                return existingImagePath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error while uploading file: {ex.Message}");
                return null;
            }
        }

    }
}

