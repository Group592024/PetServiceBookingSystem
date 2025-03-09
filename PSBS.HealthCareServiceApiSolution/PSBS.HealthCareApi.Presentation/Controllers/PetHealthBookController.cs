using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.DTOs.Conversions;
using PSBS.HealthCareApi.Application.DTOs.Conversions.PSBS.HealthCareApi.Application.DTOs.Conversions;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PetHealthBookController : ControllerBase
    {
        private readonly IPetHealthBook petHealthBookInterface;

        public PetHealthBookController(IPetHealthBook petHealthBookInterface)
        {
            this.petHealthBookInterface = petHealthBookInterface;
        }

        // GET api/petHealthBooks
        [HttpGet]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetHealthBookDTO>>> GetPetHealthBooks()
        {
            try
            {
                var petHealthBooks = await petHealthBookInterface.GetAllAsync();
                if (!petHealthBooks.Any())
                    return NotFound(new Response(false, "No PetHealthBooks found"));

                var (_, list) = PetHealthBookConversion.FromEntity(null!, petHealthBooks);
                return list!.Any()
                    ? Ok(new Response(true, "PetHealthBooks retrieved successfully") { Data = list })
                    : NotFound(new Response(false, "No PetHealthBooks found"));
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return StatusCode(500, new Response(false, $"An error occurred: {ex.Message}"));
            }
        }

        // GET api/petHealthBooks/5
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<PetHealthBookDTO>> GetPetHealthBooksById(Guid id)
        {
            try
            {
                var petHealthBook = await petHealthBookInterface.GetByIdAsync(id);
                if (petHealthBook == null)
                    return NotFound(new Response(false, "PetHealthBook not found"));

                var (_petHealthBook, _) = PetHealthBookConversion.FromEntity(petHealthBook, null!);
                return _petHealthBook is not null
                    ? Ok(new Response(true, "PetHealthBook retrieved successfully") { Data = _petHealthBook })
                    : NotFound(new Response(false, "PetHealthBook not found"));
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return StatusCode(500, new Response(false, $"An error occurred: {ex.Message}"));
            }
        }

        // POST api/petHealthBooks
        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreatePetHealthBooks([FromBody] PetHealthBookDTO petHealthBookDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new Response(false, "Invalid input") { Data = ModelState });

                if (petHealthBookDTO.healthBookId == Guid.Empty)
                {
                    return BadRequest(new Response(false, "HealthBookId cannot be null or empty"));
                }

                if (petHealthBookDTO.medicineIds == null || !petHealthBookDTO.medicineIds.Any())
                {
                    return BadRequest(new Response(false, "MedicineIds cannot be null or empty"));
                }

                var petHealthBookEntity = PetHealthBookConversion.ToEntity(petHealthBookDTO);

                var response = await petHealthBookInterface.CreateAsync(petHealthBookEntity);

                return response.Flag ? Ok(response) : BadRequest(response);
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return StatusCode(500, new Response(false, $"An error occurred: {ex.Message}"));
            }
        }



        // PUT api/petHealthBooks/5
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdatePetHealthBooks(Guid id, [FromBody] PetHealthBookDTO petHealthBook)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new Response(false, "Invalid input"));

                var getEntity = PetHealthBookConversion.ToEntity(petHealthBook);
                var response = await petHealthBookInterface.UpdateAsync(getEntity);
                return response.Flag ? Ok(response) : BadRequest(response);
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return StatusCode(500, new Response(false, $"An error occurred: {ex.Message}"));
            }
        }

        // DELETE api/petHealthBooks/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeletePetHealthBooks(Guid id)
        {
            try
            {
                var petHealthBook = await petHealthBookInterface.GetByIdAsync(id);
                if (petHealthBook == null)
                    return NotFound(new Response(false, "PetHealthBook not found"));

                var response = await petHealthBookInterface.DeleteAsync(petHealthBook);
                return response.Flag ? Ok(response) : BadRequest(response);
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return StatusCode(500, new Response(false, $"An error occurred: {ex.Message}"));
            }
        }
    }
}
