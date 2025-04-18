using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.DTOs.Conversions;
using PetApi.Application.Interfaces;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PetTypeController : ControllerBase
    {
        private readonly IPetType petInterface;
        private readonly IPetBreed _petBreed;

        public PetTypeController(IPetType petInterface, IPetBreed petBreed)
        {
            this.petInterface = petInterface;
            _petBreed = petBreed;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<PetTypeDTO>>> GetPetTypes()
        {
            var pets = await petInterface.GetAllAsync();
            if (!pets.Any())
                return NotFound(new Response(false, "No pet types detected in the database"));

            var (_, list) = PetTypeConversion.FromEntity(null!, pets);
            return Ok(new Response(true, "Service types retrieved successfully")
            {
                Data = list
            });
        }

        [HttpGet("{id:Guid}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<PetTypeDTO>> GetPetType(Guid id)
        {

            var pet = await petInterface.GetByIdAsync(id);
            if (pet is null)
            {
                return NotFound(new Response(false, "PetType requested not found"));
            }

            var (_pet, _) = PetTypeConversion.FromEntity(pet, null!);
            return Ok(new Response(true, "Pet types retrieved successfully")
            {
                Data = _pet
            });
        }


        [HttpPost("upload-image/{id:Guid}")]
        [Authorize(Policy = "AdminOrStaff")]
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
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreatePetType([FromForm] CreatePetTypeDTO pet, IFormFile imageFile)
        {
            if (!ModelState.IsValid)
                return BadRequest(new Response(false, "Validation Error") { Data = ModelState });

            string imagePath = await HandleImageUpload(imageFile);

            if (imagePath == null)
            {
                return BadRequest(new Response(false, "The uploaded file failed"));
            }

            var existingVariant = await petInterface.GetByAsync(x => x.PetType_Name.ToLower().Trim().Equals(pet.PetType_Name.ToLower().Trim()));
            if (existingVariant != null)
            {
                return Conflict(new Response(false, $"Pet type with name {existingVariant.PetType_Name} is already existed"));
            }

            var getEntity = PetTypeConversion.ToEntity(pet, imagePath);

            var response = await petInterface.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id:Guid}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdatePetType([FromRoute] Guid id, [FromForm] UpdatePetTypeDTO pet, IFormFile? imageFile = null)
        {
            Console.WriteLine("pet " + pet);
            if (!ModelState.IsValid)
                return BadRequest(new Response(false, "Validation Error") { Data = ModelState });

            var existingPet = await petInterface.GetByIdAsync(id);
            if (existingPet == null)
                return NotFound(new Response(false, $"Pet with ID {id} not found"));

            bool hasChanges =
                existingPet.PetType_Name != pet.PetType_Name ||

                existingPet.PetType_Description != pet.PetType_Description ||
                existingPet.IsDelete != pet.IsDelete ||
                imageFile != null;

            if (!hasChanges)
            {
                return NoContent();
            }

            string? imagePath = existingPet.PetType_Image;
            if (imageFile != null)
            {
                var uploadedImagePath = await HandleImageUpload(imageFile, existingPet.PetType_Image);

                if (uploadedImagePath == null)
                {
                    return BadRequest(new Response(false, "Invalid image format."));
                }

                imagePath = uploadedImagePath;
            }


            // Chuyển đổi và cập nhật
            var updatedEntity = PetTypeConversion.ToEntity(pet, imagePath);
            updatedEntity.PetType_ID = id;
            Console.WriteLine("update entity: " + updatedEntity.PetType_ID);
            Console.WriteLine("update entity: " + updatedEntity.PetType_Name);
            Console.WriteLine("update entity: " + updatedEntity.PetType_Description);
            Console.WriteLine("update entity: " + updatedEntity.PetType_Image);
            Console.WriteLine("update entity: " + updatedEntity.IsDelete);
            var response = await petInterface.UpdateAsync(updatedEntity);

            Console.WriteLine("response ddaay: " + response);
            if (!response.Flag)
            {
                return BadRequest(new Response(false, "Failed to update pet type"));
            }


            return response.Flag ? Ok(response) : BadRequest(response);
        }

        private async Task<string?> HandleImageUpload(IFormFile imageFile, string? existingImagePath = null)
        {
            if (imageFile != null && imageFile.Length > 0)
            {

                // Kiểm tra MIME type
                var validImageTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
                if (!validImageTypes.Contains(imageFile.ContentType))
                {
                    return null;
                }

                // Kiểm tra phần mở rộng
                var validExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLower();
                if (!validExtensions.Contains(fileExtension))
                {
                    return null;
                }


                // Đường dẫn thư mục lưu ảnh
                var imagesDirectory = Path.Combine(Directory.GetCurrentDirectory(), "images");
                if (!Directory.Exists(imagesDirectory))
                {
                    Directory.CreateDirectory(imagesDirectory);
                }

                // Tạo tên file duy nhất bằng cách kết hợp DateTime với Guid và đuôi file gốc
                var uniqueFileName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                var imagePath = Path.Combine(imagesDirectory, uniqueFileName);

                // Ghi file
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                // Trả về đường dẫn để lưu trong database (đường dẫn tương đối)
                return $"/images/{uniqueFileName}";
            }

            // Nếu không upload file mới, trả về đường dẫn ảnh hiện tại (nếu có)
            return existingImagePath;
        }


        [HttpDelete("{id:Guid}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeletePetType(Guid id)
        {
            var existingPetType = await petInterface.GetByIdAsync(id);
            if (existingPetType == null)
                return NotFound(new Response(false, $"Pet type with ID {id} not found"));
            Response response;
            var checkPetType = await _petBreed.CheckIfPetTypeHasPetBreed(id);


            if (!existingPetType.IsDelete)
            {
                response = await petInterface.DeleteAsync(existingPetType);
                var deletePetBreed = await _petBreed.DeleteByPetTypeIdAsync(id);
                return response.Flag ? Ok(response) : BadRequest(response);
            }
            else
            {
                if (!checkPetType)
                {
                    response = await petInterface.DeleteSecondAsync(existingPetType);
                    return response.Flag ? Ok(response) : BadRequest(response);
                }
                else
                {
                    return Conflict(new Response(false, "Can't delete this pet type because it has pet breed"));
                }
            }
        }
        [HttpGet("available")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<PetTypeDTO>>> GetAvailablePetTypes()
        {
            var pettypes = await petInterface.ListAvailablePetTypeAsync();
            if (!pettypes.Any())
            {
                return NotFound(new Response(false, "No pet types found"));
            }

            var (_, petTypeDtos) = PetTypeConversion.FromEntity(null!, pettypes);
            return Ok(new Response(true, "Available pet types retrieved successfully")
            {
                Data = petTypeDtos
            });
        }
    }
}
