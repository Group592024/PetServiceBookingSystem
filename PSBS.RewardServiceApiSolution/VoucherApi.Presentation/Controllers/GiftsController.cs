using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Application.DTOs.Conversions;
using VoucherApi.Application.DTOs.GiftDTOs;
using VoucherApi.Application.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VoucherApi.Presentation.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class GiftsController(IGift giftInterface) : ControllerBase
    {
        // GET: api/<GiftsController>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GiftDTO>>> GetGiftsListForCustomer()
        {
            var gifts = await giftInterface.GetGiftListForCustomerAsync();
            if (!gifts.Any())
            {
                return NotFound(new Response(false, "No gifts detected"));
            }
            var (_, listGifts) = GiftConversion.FromEntityCustomerFormat(null!, gifts);

            return Ok(new Response(true, "Gifts retrieved successfully!")
            {
                Data = listGifts
            });
        }

        [HttpGet("admin-gift-list")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<AdminGiftListDTO>>> GetGiftsListWithAdminFormat()
        {
            var gifts = await giftInterface.GetAllAsync();
            if (!gifts.Any())
            {
                return NotFound(new Response(false, "No gifts detected"));
            }
            var (_, listGifts) = GiftConversion.FromEntityAdminListFormat(null!, gifts);

            return Ok(new Response(true, "Gifts retrieved successfully!")
            {
                Data = listGifts
            });
        }

        // GET api/<GiftsController>/5
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<GiftDTO>> GetGiftById(Guid id)
        {
            var gift = await giftInterface.GetByIdAsync(id);
            if (gift == null)
            {
                return NotFound(new Response(false, "The gift requested not found"));
            }
            var (findingGift, _) = GiftConversion.FromEntityWithStatus(gift, null!);
            return Ok(new Response(true, "The gift retrieved successfully")
            {
                Data = findingGift
            });
        }

        [HttpGet("detail/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CustomerGiftDTOs>> GetGiftByIdForCustomer(Guid id)
        {
            var gift = await giftInterface.GetGiftDetailForCustomerAsync(id);
            if (gift == null)
            {
                return NotFound(new Response(false, "The gift requested not found"));
            }
            var (findingGift, _) = GiftConversion.FromEntityCustomerFormat(gift, null!);
            return Ok(new Response(true, "The gift retrieved successfully")
            {
                Data = findingGift
            });
        }

        // POST api/<GiftsController>
        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreateGift([FromForm] GiftDTO creattingGift)
        {
            ModelState.Remove(nameof(GiftDTO.giftId));
            if (creattingGift.imageFile == null)
            {
                ModelState.AddModelError("imageFile", "Please upload a image for gift");
            }
            if (creattingGift.giftPoint <= 0)
            {
                ModelState.AddModelError("giftPoint", "Please enter the point greater than 0.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Fail input") { Data = ModelState });
            }
            

            string? imagePath = null;
            if (creattingGift.imageFile != null && creattingGift.imageFile.Length > 0)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(creattingGift.imageFile.FileName);
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImageGifts");
                var fullPath = Path.Combine(folderPath, fileName);

                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await creattingGift.imageFile.CopyToAsync(stream);
                }

                imagePath = $"/ImageGifts/{fileName}";
            }
            var gift = GiftConversion.ToEntity(creattingGift, imagePath);
            var response = await giftInterface.CreateAsync(gift);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // PUT api/<GiftsController>/5
        [HttpPut]
        [Authorize(Policy = "AdminOrStaffOrCustomer")]
        public async Task<ActionResult<Response>> UpdateGift([FromForm] UpdateGiftDTO updateGift)
        {
            if(updateGift.giftId == Guid.Empty)
            {
                ModelState.AddModelError("giftId", "The ID is invalid.");
            }
            if (updateGift.giftPoint <= 0)
            {
                ModelState.AddModelError("giftPoint", "Please enter the point greater than 0.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Fail input") { Data = ModelState });
            }
            var existingGift = await giftInterface.GetByIdAsync(updateGift.giftId);
            if (existingGift == null)
            {
                return NotFound(new Response(false, "The gift is not found!"));
            }
            var getEntity = GiftConversion.ToEntityForUpdate(updateGift);
            if (updateGift.imageFile != null && updateGift.imageFile.Length > 0)
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), existingGift.GiftImage.TrimStart('/'));

                if (!string.IsNullOrEmpty(existingGift.GiftImage) && System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
                //save the new image
                var newFileName = Guid.NewGuid() + Path.GetExtension(updateGift.imageFile.FileName);
                var newFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImageGifts");
                var newFullPath = Path.Combine(newFolderPath, newFileName);

                if (!Directory.Exists(newFolderPath))
                {
                    Directory.CreateDirectory(newFolderPath);
                }
                using (var stream = new FileStream(newFullPath, FileMode.Create))
                {
                    await updateGift.imageFile.CopyToAsync(stream);
                }
                getEntity.GiftImage = $"/ImageGifts/{newFileName}";
            }
            else
            {
                getEntity.GiftImage = existingGift.GiftImage;
            }
            var response = await giftInterface.UpdateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // DELETE api/<GiftsController>/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeleteGift(Guid id)
        {
            var existingGift = await giftInterface.GetByIdAsync(id);
            if (existingGift == null)
            {
                return NotFound(new Response(false, "The gift is not found!"));
            }
            var giftDeleteState = existingGift.GiftStatus;
            var giftImagePath = existingGift.GiftImage;
            var response = await giftInterface.DeleteAsync(existingGift);
            if (giftDeleteState && response.Flag)
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), giftImagePath.TrimStart('/'));

                if (!string.IsNullOrEmpty(existingGift.GiftImage) && System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }
            return response.Flag ? response : response;
        }
    }
}
