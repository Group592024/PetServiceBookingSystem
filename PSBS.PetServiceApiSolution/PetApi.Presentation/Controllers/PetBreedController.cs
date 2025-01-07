using PetApi.Application.DTOs.Conversions;
using PetApi.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using PetApi.Application.DTOs;

namespace PetApi.Presentation.Controllers
{
    [Route("api/petBreed")]
    [ApiController]
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
        public async Task<ActionResult<IEnumerable<PetTypeDTO>>> GetPetTypes()
        {
            var petTypes = await _petType.GetAllAsync();
            if (!petTypes.Any())
                return NotFound("No pet types found in the database");

            var petTypeDtos = petTypes.Select(petType => new PetTypeDTO(
                petType.PetType_ID,
                petType.PetType_Name,
                petType.PetType_Image,
                petType.PetType_Description
            ));

            return Ok(petTypeDtos);
        }

        [HttpGet]
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

            return response.Flag ? Ok(response) : BadRequest(new Response(false, "Failed to update the pet breed"));
        }

        [HttpDelete("{id}")]
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
        public async Task<ActionResult<IEnumerable<PetBreedDTO>>> GetAvailablePetBreeds()
        {
            var petbreeds = await _petBreed.ListAvailablePetBreedAsync();
            if (!petbreeds.Any())
            {
                return NotFound(new Response(false, "No available rooms found"));
            }

            var (_, petBreedDtos) = PetBreedConversion.FromEntity(null!, petbreeds);
            return Ok(new Response(true, "Available rooms retrieved successfully")
            {
                Data = petBreedDtos
            });
        }

    }
}
