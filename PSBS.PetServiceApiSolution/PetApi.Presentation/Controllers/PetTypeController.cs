using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.DTOs.Conversions;
using PetApi.Application.Interfaces;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetTypeController : ControllerBase
    {
        private readonly IPetType petInterface;

        public PetTypeController(IPetType petInterface)
        {
            this.petInterface = petInterface;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PetTypeDTO>>> GetPets()
        {
            var pets = await petInterface.GetAllAsync();
            if (!pets.Any())
                return NotFound("No pet types detected in the database");

            var (_, list) = PetTypeConversion.FromEntity(null!, pets);
            return list!.Any() ? Ok(list) : NotFound("No pet found");
        }

        [HttpGet("{id:Guid}")]
        public async Task<ActionResult<PetTypeDTO>> GetPetType(Guid id)
        {

            var pet = await petInterface.GetByIdAsync(id);
            if (pet is null)
            {
                return NotFound("PetType requested not found");
            }

            var (_pet, _) = PetTypeConversion.FromEntity(pet, null!);
            return _pet is not null ? Ok(_pet) : NotFound("PetType not found");
        }


        [HttpPost("upload-image/{id:Guid}")]
        public async Task<ActionResult<Response>> UploadImage(Guid id, IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return BadRequest("No image file provided");

            var existingPetType = await petInterface.GetByIdAsync(id);
            if (existingPetType == null)
                return NotFound($"PetType with ID {id} not found");

            var imagePath = Path.Combine("images", imageFile.FileName);
            using (var stream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            existingPetType.PetType_Image = $"/images/{imageFile.FileName}";
            var response = await petInterface.UpdateAsync(existingPetType);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPost]
        public async Task<ActionResult<Response>> CreatePet([FromForm] PetTypeDTO pet, IFormFile imageFile)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingPet = await petInterface.GetByIdAsync(pet.PetType_ID);
            if (existingPet != null)
            {
                return Conflict(new { message = "A pet with this ID already exists." });
            }

            string imagePath = await HandleImageUpload(imageFile) ?? "default_image.jpg";

            var getEntity = PetTypeConversion.ToEntity(pet with { PetType_Image = imagePath });

            var response = await petInterface.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        public async Task<ActionResult<Response>> UpdatePetType([FromForm] PetTypeDTO pet, IFormFile? imageFile = null)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingPet = await petInterface.GetByIdAsync(pet.PetType_ID);
            if (existingPet == null)
                return NotFound($"Pet with ID {pet.PetType_ID} not found");

            bool hasChanges =
                existingPet.PetType_Name != pet.PetType_Name ||
                existingPet.PetType_Image != pet.PetType_Image ||
                existingPet.PetType_Description != pet.PetType_Description ||
                imageFile != null;

            if (!hasChanges)
            {
                return NoContent();
            }

            // Xử lý hình ảnh
            string? imagePath = existingPet.PetType_Image; // Giữ nguyên đường dẫn cũ nếu không có tệp mới
            if (imageFile != null)
            {
                imagePath = await HandleImageUpload(imageFile, existingPet.PetType_Image);
            }

            // Chuyển đổi và cập nhật
            var updatedEntity = PetTypeConversion.ToEntity(pet with { PetType_Image = imagePath });
            var response = await petInterface.UpdateAsync(updatedEntity);
            if (!response.Flag)
            {
                return BadRequest(new { message = "Failed to update pet." });
            }

            return Ok(response);
        }

        private async Task<string?> HandleImageUpload(IFormFile imageFile, string? existingImagePath = null)
        {
            if (imageFile != null && imageFile.Length > 0)
            {
                var imagesDirectory = Path.Combine(Directory.GetCurrentDirectory(), "images");
                if (!Directory.Exists(imagesDirectory))
                {
                    Directory.CreateDirectory(imagesDirectory);
                }

                var imagePath = Path.Combine(imagesDirectory, Path.GetFileName(imageFile.FileName));
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }
                return $"/images/{Path.GetFileName(imageFile.FileName)}";
            }
            return existingImagePath;
        }


        [HttpDelete("{id:Guid}")]
        public async Task<ActionResult<Response>> DeletePet(Guid id)
        {
            var existingPet = await petInterface.GetByIdAsync(id);
            if (existingPet == null)
                return NotFound($"Pet with ID {id} not found");
            var response = await petInterface.DeleteAsync(existingPet);
            return response.Flag ? Ok(response) : BadRequest(response);
        }
    }
}
