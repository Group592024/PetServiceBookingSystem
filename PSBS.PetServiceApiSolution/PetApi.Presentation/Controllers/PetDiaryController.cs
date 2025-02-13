using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.DTOs.Conversions;
using PetApi.Application.Interfaces;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetDiaryController : ControllerBase
    {
        private readonly IPetDiary _diary;
        private readonly IPet _pet;

        public PetDiaryController(IPetDiary diary, IPet pet)
        {
            _diary = diary;
            _pet = pet;
        }

        [HttpGet("diaries/{id}")]
        public async Task<ActionResult<IEnumerable<PetDiaryDTO>>> GetPetDiaryListByPetId(Guid id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 4)
        {
            var pet = await _pet.GetByIdAsync(id);

            if (pet == null)
            {
                return NotFound(new Response(false, $"Pet with GUID {id} not found or is deleted"));
            }

            var (diaries, totalPages) = await _diary.GetAllDiariesByPetIdsAsync(id, pageIndex, pageSize);


            if (!diaries.Any())
            {
                return NotFound(new Response(false, "No diaries found in the database"));
            }

            var (_, diariesDtos) = PetDiaryConversion.FromEntity(null!, diaries);

            return Ok(new Response(true, "Pet diaries retrieved successfully")
            {
                Data = new
                {
                    data = diariesDtos,
                    meta = new
                    {
                        currentPage = pageIndex,
                        totalPages = (int)Math.Ceiling((double)totalPages / pageSize),
                    }
                }
            });
        }

        [HttpPost]
        public async Task<ActionResult<Response>> CreatePetDiary([FromBody] CreatePetDiaryDTO pet)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var getEntity = PetDiaryConversion.ToEntity(pet);

            var response = await _diary.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id:Guid}")]
        public async Task<ActionResult<Response>> UpdatePetDiary([FromRoute] Guid id, [FromBody] UpdatePetDiaryDTO pet)
        {
            Console.WriteLine("pet " + pet);
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingPet = await _diary.GetByIdAsync(id);
            if (existingPet == null)
                return NotFound($"Pet with ID {id} not found");

            bool hasChanges =
                existingPet.Diary_Content != pet.Diary_Content;

            if (!hasChanges)
            {
                return NoContent();
            }

            // Chuyển đổi và cập nhật
            var updatedEntity = PetDiaryConversion.ToEntity(pet);
            updatedEntity.Diary_ID = id;
            updatedEntity.Pet_ID = existingPet.Pet_ID;

            var response = await _diary.UpdateAsync(updatedEntity);

            if (!response.Flag)
            {
                return BadRequest(new { message = "Failed to update pet diary." });
            }


            return Ok(response);
        }

        [HttpDelete("{id:Guid}")]
        public async Task<ActionResult<Response>> DeletePetDiary(Guid id)
        {
            var existingPetDiary = await _diary.GetByIdAsync(id);
            if (existingPetDiary == null)
                return NotFound($"Pet diary with ID {id} not found");
            Response response = await _diary.DeleteAsync(existingPetDiary);
            return response.Flag ? Ok(response) : BadRequest(response);

        }

    }
}
