using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Application.DTOs;
using VoucherApi.Application.DTOs.Conversions;
using VoucherApi.Application.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VoucherApi.Presentation.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GiftsController(IGift giftInterface) : ControllerBase
    {
        // GET: api/<GiftsController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GiftDTO>>> GetGiftsList()
        {
            var gifts = await giftInterface.GetAllAsync();
            if (!gifts.Any())
            {
                return NotFound(new Response(false, "No gifts detected"));
            }
            var (_, listGifts) = GiftConversion.FromEntity(null!, gifts);

            return Ok(new Response(true, "Gifts retrieved successfully!")
            {
                Data = listGifts
            });
        }

        // GET api/<GiftsController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GiftDTO>> GetGiftById(Guid id)
        {
            var gift = await giftInterface.GetByIdAsync(id);
            if (gift == null)
            {
                return NotFound(new Response(false, "The gift requested not found"));
            }
            var (findingGift, _) = GiftConversion.FromEntity(gift, null!);
            return Ok(new Response(true, "The gift retrieved successfully")
            {
                Data = findingGift
            });
        }

        // POST api/<GiftsController>
        [HttpPost]
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
        public async Task<ActionResult<Response>> UpdateGift([FromForm] GiftDTO updateGift)
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
            var getEntity = GiftConversion.ToEntity(updateGift);
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
        public async Task<ActionResult<Response>> DeleteGift(Guid id)
        {
            var existingGift = await giftInterface.GetByIdAsync(id);
            if (existingGift == null)
            {
                return NotFound(new Response(false, "The gift is not found!"));
            }
            var response = await giftInterface.DeleteAsync(existingGift);
            if (response.Flag)
            {
                return Ok(response);
            }
            return BadRequest(new Response() { Flag = false, Message = "Failed to delete the gift" });
        }
    }
}
