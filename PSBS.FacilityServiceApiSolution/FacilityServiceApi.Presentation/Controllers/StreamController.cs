using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Infrastructure.Repositories;
using FacilityServiceApi.Infrastructure.Streams;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using System.Threading.Tasks;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StreamController : Controller
    {
        private readonly StreamManager _streamManager;
        private readonly ICamera _cameraRepository;
        
        public StreamController(StreamManager streamManager, ICamera cameraRepository)
        {
            _streamManager = streamManager;
            _cameraRepository = cameraRepository;
        }

        [HttpPost("start/{cameraId}")]
        public async Task<IActionResult> Start(Guid cameraId)
        {
            try
            {
                if (cameraId == Guid.Empty)
                {
                    return BadRequest(new Response(false, "Camera ID cannot be empty"));
                }

                var cam = await _cameraRepository.GetByIdAsync(cameraId);
                if (cam is null)
                {
                    return NotFound(new Response(false, "Camera not found"));
                }

                if (string.IsNullOrWhiteSpace(cam.rtspUrl))
                {
                    return BadRequest(new Response(false, "Camera RTSP URL is not configured"));
                }

                var result = _streamManager.StartStream(cameraId, cam.rtspUrl);
                
                if (result.Flag)
                {
                    return Ok(result); // Returns Response with Data containing the stream URL
                }
                else
                {
                    return StatusCode(500, result); // Returns Response with error message
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response(false, $"An error occurred while starting the stream: {ex.Message}"));
            }
        }

        [HttpPost("stop/{cameraId}")]
        public IActionResult Stop(Guid cameraId)
        {
            try
            {
                if (cameraId == Guid.Empty)
                {
                    return BadRequest(new Response(false, "Camera ID cannot be empty"));
                }

                var result = _streamManager.StopStream(cameraId);
                
                if (result.Flag)
                {
                    return Ok(result); // Returns success Response
                }
                else
                {
                    return NotFound(result); // Returns not found Response
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response(false, $"An error occurred while stopping the stream: {ex.Message}"));
            }
        }
    }
}