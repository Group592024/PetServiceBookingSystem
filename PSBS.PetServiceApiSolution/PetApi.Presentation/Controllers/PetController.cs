using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.DTOs.Conversions;
using PetApi.Application.Interfaces;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Presentation.Controllers
{
    [Route("api/pet")]
    [ApiController]
    [Authorize]
    public class PetController : ControllerBase
    {
        private readonly IPetBreed _petBreed;
        private readonly IPet _pet;
        public PetController(IPetBreed petBreedService, IPet petService)
        {
            _petBreed = petBreedService;
            _pet = petService;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetDTO>>> GetPetsList()
        {
            var pets = (await _pet.GetAllAsync())
                           .ToList();
            if (!pets.Any())
            {
                return NotFound(new Response(false, "No pets found in the database"));
            }

            var (_, petDtos) = PetConversion.FromEntity(null!, pets);
            return Ok(new Response(true, "Pets retrieved successfully")
            {
                Data = petDtos
            });
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<PetDTO>> GetPetById(Guid id)
        {
            var pet = await _pet.GetByIdAsync(id);
            if (pet == null)
            {
                return NotFound(new Response(false, $"Pet with GUID {id} not found"));
            }

            var (petDto, _) = PetConversion.FromEntity(pet, null!);
            return Ok(new Response(true, "Pet retrieved successfully")
            {
                Data = petDto
            });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> CreatePet([FromForm] PetDTO creatingPet, IFormFile? imageFile)
        {
            ModelState.Remove(nameof(PetDTO.petId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var petBreed = await _petBreed.GetByIdAsync(creatingPet.petBreedId);
            if (petBreed == null)
            {
                return NotFound(new Response(false, $"Pet Breed with ID {creatingPet.petBreedId} not found"));
            }
            string imagePath = await HandleImageUpload(imageFile) ?? "default_image.jpg";
            var newPetEntity = PetConversion.ToEntity(creatingPet with { petImage = imagePath });
            var response = await _pet.CreateAsync(newPetEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> UpdatePet([FromForm] PetDTO updatingPet, IFormFile? imageFile = null)
        {
            ModelState.Remove(nameof(PetDTO.petId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var existingPet = await _pet.GetByIdAsync(updatingPet.petId);
            if (existingPet == null)
            {
                return NotFound(new Response(false, $"Pet with ID {updatingPet.petId} not found"));
            }
            string? imagePath = imageFile != null
                ? await HandleImageUpload(imageFile, existingPet.Pet_Image)
                : existingPet.Pet_Image;

            var updatedPet = PetConversion.ToEntity(updatingPet with { petImage = imagePath });
            var response = await _pet.UpdateAsync(updatedPet);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<Response>> DeletePet(Guid id)
        {
            var existingPet = await _pet.GetByIdAsync(id);
            if (existingPet == null)
            {
                return NotFound(new Response(false, $"Pet with GUID {id} not found"));
            }
            var response = await _pet.DeleteAsync(existingPet);

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

        [HttpGet("available/{accountId}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetDTO>>> GetAvailablePets(Guid accountId)
        {
            var pets = await _pet.ListAvailablePetAsync(accountId);
            if (!pets.Any())
            {
                return NotFound(new Response(false, "No available pets found"));
            }
            var (_, petDtos) = PetConversion.FromEntity(null!, pets);
            return Ok(new Response(true, "Available pets retrieved successfully")
            {
                Data = petDtos
            });
        }


        [HttpGet("available")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetDTO>>> GetAvailablePet()
        {
            var pets = (await _pet.GetAllAsync()).Where(p => !p.IsDelete)
                           .ToList();
            if (!pets.Any())
            {
                return NotFound(new Response(false, "No available pets found"));
            }
            var (_, petDtos) = PetConversion.FromEntity(null!, pets);
            return Ok(new Response(true, "Available pets retrieved successfully")
            {
                Data = petDtos
            });
        }

    }
}
