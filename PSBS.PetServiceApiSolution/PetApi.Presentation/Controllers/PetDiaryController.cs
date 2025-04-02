using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.DTOs.Conversions;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PetDiaryController : ControllerBase
    {
        private readonly IPetDiary _diary;
        private readonly IPet _pet;

        public PetDiaryController(IPetDiary diary, IPet pet)
        {
            _diary = diary;
            _pet = pet;
        }

        [HttpGet("categories/{petId}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategoriesByPetId(Guid petId)
        {
            var pet = await _pet.GetByIdAsync(petId);

            if (pet == null)
            {
                return NotFound(new Response(false, $"Pet with GUID {petId} not found or is deleted"));
            }

            var categories = await _diary.GetAllCategories(petId);


            if (!categories.Any())
            {
                return NotFound(new Response(false, "No categories found in the database"));
            }

            return Ok(new Response(true, "Diary categories retrieved successfully")
            {
                Data = new
                {
                    data = categories
                }
            });
        }

        [HttpGet("byCategories")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetDiary>>> GetDiariesByCategory([FromQuery] string category)
        {
            var diaries = await _diary.GetDiariesByCategory(category);


            if (!diaries.Any())
            {
                return NotFound(new Response(false, "No diaries found in the database"));
            }

            return Ok(new Response(true, "Diaries retrieved successfully")
            {
                Data = new
                {
                    data = diaries
                }
            });
        }

        [HttpGet("diaries/{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetDiaryDTO>>> GetPetDiaryListByPetId([FromQuery] string? category, [FromRoute] Guid id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 4)
        {
            var pet = await _pet.GetByIdAsync(id);

            if (pet == null)
            {
                return NotFound(new Response(false, $"Pet with GUID {id} not found or is deleted"));
            }

            var (diaries, totalPages) = await _diary.GetAllDiariesByPetIdsAsync(category, id, pageIndex, pageSize);


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
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> CreatePetDiary([FromBody] CreatePetDiaryDTO pet)
        {
            if (!ModelState.IsValid)
                return BadRequest(new Response(false, "Validation Error") { Data = ModelState });

            var existingPet = await _pet.GetByIdAsync(pet.Pet_ID);
            if (existingPet == null)
                return NotFound(new Response(false, $"Pet with GUID {pet.Pet_ID} not found or is deleted"));

            var getEntity = PetDiaryConversion.ToEntity(pet);

            var response = await _diary.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id:Guid}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> UpdatePetDiary([FromRoute] Guid id, [FromBody] UpdatePetDiaryDTO pet)
        {
            Console.WriteLine("pet " + pet);
            if (!ModelState.IsValid)
                return BadRequest(new Response(false, "Validation Error") { Data = ModelState });

            var existingPetDiary = await _diary.GetByIdAsync(id);
            if (existingPetDiary == null)
                return NotFound(new Response(false, $"Pet diary with GUID {id} not found or is deleted"));

            bool hasChanges =
                existingPetDiary.Diary_Content != pet.Diary_Content ||
                existingPetDiary.Category != pet.Category;

            if (!hasChanges)
            {
                return NoContent();
            }

            // Chuyển đổi và cập nhật
            var updatedEntity = PetDiaryConversion.ToEntity(pet);
            updatedEntity.Diary_ID = id;
            updatedEntity.Pet_ID = existingPetDiary.Pet_ID;

            var response = await _diary.UpdateAsync(updatedEntity);

            if (!response.Flag)
            {
                return BadRequest(new { message = "Failed to update pet diary." });
            }


            return Ok(response);
        }

        [HttpDelete("{id:Guid}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
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
