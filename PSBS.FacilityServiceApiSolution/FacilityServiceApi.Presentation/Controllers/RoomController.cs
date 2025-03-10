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
    public class RoomController : ControllerBase
    {
        private readonly IRoom _room;
        private readonly IRoomType _roomType;

        public RoomController(IRoom roomService, IRoomType roomTypeService)
        {
            _room = roomService;
            _roomType = roomTypeService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetRoomsList()
        {
            var rooms = (await _room.GetAllAsync())
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
        [AllowAnonymous]
        public async Task<ActionResult<RoomDTO>> GetRoomById(Guid id)
        {
            var room = await _room.GetByIdAsync(id);
            if (room == null)
            {
                return NotFound(new Response(false, $"Room with GUID {id} not found"));
            }

            var (roomDto, _) = RoomConversion.FromEntity(room, null!);
            return Ok(new Response(true, "Room retrieved successfully")
            {
                Data = roomDto
            });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
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
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdateRoom([FromForm] RoomDTO updatingRoom, IFormFile? imageFile = null)
        {
            ModelState.Remove(nameof(RoomDTO.roomId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var existingRoom = await _room.GetByIdAsync(updatingRoom.roomId);
            if (existingRoom == null)
            {
                return NotFound(new Response(false, $"Room with ID {updatingRoom.roomId} not found "));
            }
            string? imagePath = imageFile != null
                ? await HandleImageUpload(imageFile, existingRoom.roomImage)
                : existingRoom.roomImage;

            var updatedRoom = RoomConversion.ToEntity(updatingRoom with { roomImage = imagePath });
            var response = await _room.UpdateAsync(updatedRoom);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeleteRoom(Guid id)
        {
            var existingRoom = await _room.GetByIdAsync(id);
            if (existingRoom == null)
            {
                return NotFound(new Response(false, $"Room with GUID {id} not found or already deleted"));
            }

            var response = await _room.DeleteAsync(existingRoom);

            return response.Flag
                ? Ok(response)
                : BadRequest(response);
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

        [HttpGet("available")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetAvailableRooms()
        {
            var rooms = await _room.ListAvailableRoomsAsync();
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

        [HttpGet("details/{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<RoomDTO>> GetRoomDetailsById(Guid id)
        {
            try
            {
                var room = await _room.GetRoomDetailsAsync(id);
                if (room == null)
                {
                    return NotFound(new Response(false, $"Room with GUID {id} not found or has been deleted"));
                }

                var (roomDto, _) = RoomConversion.FromEntity(room, null!);
                return Ok(new Response(true, "Room details retrieved successfully")
                {
                    Data = roomDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response(false, "An error occurred while retrieving room details"));
            }
        }

    }
}