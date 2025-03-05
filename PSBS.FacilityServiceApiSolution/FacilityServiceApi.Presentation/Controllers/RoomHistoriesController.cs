using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoomHistoriesController (IRoomHistory roomHistoryInterface) : ControllerBase
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
        [Authorize(Policy = "AdminOrStaff")]
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
        [Authorize(Policy = "AdminOrStaff")]
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
    }
}
