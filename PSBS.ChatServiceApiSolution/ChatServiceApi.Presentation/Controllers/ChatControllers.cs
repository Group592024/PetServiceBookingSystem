using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using System;
using System.IO;
using System.Threading.Tasks;

namespace ChatServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatControllers : ControllerBase
    {
        private readonly IChatRepository _chatRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ChatControllers( IChatRepository chatRepository, IWebHostEnvironment webHostEnvironment)
        {
            _chatRepository = chatRepository;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            // Call the repository's StoreImage method, passing the image and webRootPath
            var response = await _chatRepository.StoreImage(image, _webHostEnvironment.WebRootPath);

            if (response.Flag)
            {
                // Construct the full URL
                string imageUrl = $"{response.Data}";

                // Return a successful response with the constructed URL
                return Ok(new Response(true, response.Message) { Data = imageUrl });
            }
            else
            {
                // Return a bad request response with the repository's error message
                return BadRequest(response);
            }
        }
        
    }
}