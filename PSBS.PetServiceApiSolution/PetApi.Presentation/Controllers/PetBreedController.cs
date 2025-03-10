using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.DTOs.Conversions;
using PetApi.Application.Interfaces;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Presentation.Controllers
{
    [Route("api/petBreed")]
    [ApiController]
    [Authorize]
    public class PetBreedController : ControllerBase
    {
        private readonly IPetBreed _petBreed;
        private readonly IPetType _petType;

        public PetBreedController(IPetBreed petBreedService, IPetType petTypeService)
        {
            _petBreed = petBreedService;
            _petType = petTypeService;
        }

        [HttpGet("PetTypes")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetTypeDTO>>> GetPetTypes()
        {
            var petTypes = await _petType.GetAllAsync();
            if (!petTypes.Any())
                return NotFound("No pet types found in the database");

            var petTypeDtos = petTypes.Select(petType => new PetTypeDTO(
                petType.PetType_ID,
                petType.PetType_Name,
                petType.PetType_Image,
                petType.PetType_Description,
                petType.IsDelete
            ));

            return Ok(petTypeDtos);
        }

        [HttpGet]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetBreedDTO>>> GetPetBreedsList()
        {
            var petBreeds = (await _petBreed.GetAllAsync())
                           //.Where(pb => !pb.IsDelete)
                           .ToList();
            if (!petBreeds.Any())
            {
                return NotFound(new Response(false, "No pet breeds found in the database"));
            }

            var (_, petBreedDtos) = PetBreedConversion.FromEntity(null!, petBreeds);
            return Ok(new Response(true, "Pet breeds retrieved successfully")
            {
                Data = petBreedDtos
            });
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<PetBreedDTO>> GetPetBreedById(Guid id)
        {
            var petBreed = await _petBreed.GetByIdAsync(id);
            if (petBreed == null)
            {
                return NotFound(new Response(false, $"Pet breed with GUID {id} not found"));
            }

            var (petBreedDto, _) = PetBreedConversion.FromEntity(petBreed, null!);
            return Ok(new Response(true, "Pet breed retrieved successfully")
            {
                Data = petBreedDto
            });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreatePetBreed([FromForm] PetBreedDTO creatingPetBreed, IFormFile? imageFile)
        {
            ModelState.Remove(nameof(PetBreedDTO.petBreedId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var petType = await _petType.GetByIdAsync(creatingPetBreed.petTypeId);
            if (petType == null)
            {
                return NotFound(new Response(false, $"PetType with ID {creatingPetBreed.petTypeId} not found"));
            }
            string imagePath = await HandleImageUpload(imageFile) ?? "default_image.jpg";
            var newPetBreedEntity = PetBreedConversion.ToEntity(creatingPetBreed with { petBreedImage = imagePath });
            var response = await _petBreed.CreateAsync(newPetBreedEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdatePetBreed([FromForm] PetBreedDTO updatingPetBreed, IFormFile? imageFile = null)
        {
            ModelState.Remove(nameof(PetBreedDTO.petBreedId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var existingPetBreed = await _petBreed.GetByIdAsync(updatingPetBreed.petBreedId);
            if (existingPetBreed == null)
            {
                return NotFound(new Response(false, $"Pet breed with ID {updatingPetBreed.petBreedId} not found"));
            }
            string? imagePath = imageFile != null
                ? await HandleImageUpload(imageFile, existingPetBreed.PetBreed_Image)
                : existingPetBreed.PetBreed_Image;

            var updatedPetBreed = PetBreedConversion.ToEntity(updatingPetBreed with { petBreedImage = imagePath });
            var response = await _petBreed.UpdateAsync(updatedPetBreed);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeletePetBreed(Guid id)
        {
            var existingPetBreed = await _petBreed.GetByIdAsync(id);
            if (existingPetBreed == null)
            {
                return NotFound(new Response(false, $"Pet breed with GUID {id} not found"));
            }
            var response = await _petBreed.DeleteAsync(existingPetBreed);

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
        [HttpGet("byPetType/{petTypeId}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetBreedDTO>>> GetBreedsByPetTypeId(Guid petTypeId)
        {
            var petBreeds = await _petBreed.GetBreedsByPetTypeIdAsync(petTypeId);
            if (!petBreeds.Any())
            {
                return NotFound(new Response(false, "No pet breeds found for the given PetType ID"));
            }

            var (_, petBreedDtos) = PetBreedConversion.FromEntity(null!, petBreeds);
            return Ok(new Response(true, "Pet breeds retrieved successfully")
            {
                Data = petBreedDtos
            });
        }
        
        [HttpGet("available")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetBreedDTO>>> GetAvailablePetBreeds()
        {
            var petbreeds = await _petBreed.ListAvailablePetBreedAsync();
            if (!petbreeds.Any())
            {
                return NotFound(new Response(false, "No available pet breeds found"));
            }

            var (_, petBreedDtos) = PetBreedConversion.FromEntity(null!, petbreeds);
            return Ok(new Response(true, "Available pet breeds retrieved successfully")
            {
                Data = petBreedDtos
            });
        }

    }
}
