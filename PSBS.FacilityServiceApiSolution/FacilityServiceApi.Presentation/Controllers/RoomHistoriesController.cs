using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using FacilityServiceApi.Application.DTOs;
using PSPS.SharedLibrary.Responses;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoomHistoriesController(IRoomHistory roomHistoryInterface, IRoom roomInterface, ICamera cameraInterface) : ControllerBase
    {
        //private readonly FacilityServiceDbContext _context;
        //public RoomHistoriesController(FacilityServiceDbContext context)
        //{
        //    _context = context;
        //}
        // GET: api/<RoomHistoriesController>
        [HttpGet]
        [Authorize(Policy = "AdminOrStaff")]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<RoomHistoriesController>/5
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<RoomHistoryDTO>> GetRoomHistoryByBookingId(Guid id)
        {
            var bookingRoomItems = await roomHistoryInterface.GetRoomHistoryByBookingId(id);
            if (!bookingRoomItems.Any())
            {
                return NotFound(new Response(false, "No item detected"));
            }

            return Ok(new Response(true, "Booking room item retrieved successfully!")
            {
                Data = bookingRoomItems
            });
        }

        // POST api/<RoomHistoriesController>
        [HttpPost]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> CreateRoomHistory([FromBody] CreateRoomHistoryDTO roomHistoryDTO)
        {
            var createEntity = RoomHistoryConversion.ToEntityForCreate(roomHistoryDTO);
            var response = await roomHistoryInterface.CreateAsync(createEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // PUT api/<RoomHistoriesController>/5
        [HttpPut]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdateRoomHistory([FromBody] RoomHistoryDTO roomHistoryDTO)
        {
            var updateEntity = RoomHistoryConversion.ToEntity(roomHistoryDTO);
            var response = await roomHistoryInterface.UpdateAsync(updateEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // DELETE api/<RoomHistoriesController>/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public void Delete(int id)
        {
        }

        // PUT api/<RoomHistoriesController>/Checkout
        [HttpPut("Checkout")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CheckoutRoomHistory([FromQuery] Guid roomHistoryId)
        {
            try
            {
                // Validate input
                if (roomHistoryId == Guid.Empty)
                {
                    return BadRequest(new Response(false, "Invalid room history ID"));
                }

                // Check if room history exists
                var existingRoomHistory = await roomHistoryInterface.GetByIdAsync(roomHistoryId);
                if (existingRoomHistory == null)
                {
                    return NotFound(new Response(false, "Room history not found"));
                }

                // Checkout the room history
                var checkoutResponse = await roomHistoryInterface.CheckoutRoomHistory(roomHistoryId);
                if (!checkoutResponse.Flag)
                {
                    return BadRequest(checkoutResponse);
                }

                // Update room status to Free
                var existingRoom = await roomInterface.GetByIdAsync(existingRoomHistory.RoomId);
                if (existingRoom == null)
                {
                    // Even if room not found, consider the checkout successful but log the issue
                    LogExceptions.LogException(new Exception($"Room {existingRoomHistory.RoomId} not found after checkout"));
                    return Ok(checkoutResponse);
                }

                existingRoom.status = "Free";
                var roomResponse = await roomInterface.UpdateAsync(existingRoom);

                if (existingRoomHistory.BookingCamera && existingRoomHistory.cameraId != Guid.Empty)
                {
                   if(existingRoomHistory.cameraId == null)
                   {
                       LogExceptions.LogException(new Exception($"Camera Id {existingRoomHistory.cameraId} not found"));
                       return Ok(checkoutResponse);
                   }
                   var bookingCamera = await cameraInterface.GetByIdAsync((Guid) existingRoomHistory.cameraId);
                   if(bookingCamera == null)
                   {
                       LogExceptions.LogException(new Exception($"Camera with Id {existingRoomHistory.cameraId} not found"));
                       return Ok(checkoutResponse);
                   }
                   bookingCamera.cameraStatus = "Free";
                   var cameraResponse = await cameraInterface.UpdateAsync(bookingCamera);
                }

                return Ok(roomResponse.Flag ? checkoutResponse : roomResponse);
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return StatusCode(500, new Response(false, "An unexpected error occurred"));
            }
        }
    [HttpGet("GetAll")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> GetAllRoomHistories()
        {
            try
            {
                var allHistories = await roomHistoryInterface.GetAllAsync();

                if (allHistories == null || !allHistories.Any())
                {
                    return NotFound(new Response(false, "No Room Histories found"));
                }

                return Ok(new Response(true, "Room Histories retrieved successfully!")
                {
                    Data = allHistories
                });
            }
            catch (System.Exception ex)
            {
                LogExceptions.LogException(ex);
                return StatusCode(500, new Response(false, "Error occurred retrieving Room Histories"));
            }
        }
        [HttpPut("update-camera/{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdateCamera(Guid id, [FromBody] UpdateCameraDTO dto)
        {
            if (dto.cameraId == null || dto.cameraId == Guid.Empty)
            {
                return BadRequest(new Response(false, "CameraId is required"));
            }

            var response = await roomHistoryInterface.UpdateCameraAsync(id, dto.cameraId);
            return response.Flag ? Ok(response) : BadRequest(response);
        }


    }
}
