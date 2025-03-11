// using FacilityServiceApi.Application.Interfaces;
// using FacilityServiceApi.Domain.Entities;
// using FacilityServiceApi.Infrastructure.Repositories;
// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Mvc;
// using PSPS.SharedLibrary.Responses;

// namespace FacilityServiceApi.Presentation.Controllers
// {
//     [Route("api/[controller]")]
//     [ApiController]
//     public class CameraController : ControllerBase
//     {
//         private readonly ICamera _camera;

//         public CameraController(ICamera camera)
//         {
//             _camera = camera;
//         }
//         [HttpGet("stream/{cameraCode}")]
//         public async Task<IActionResult> GetStreamUrl(string cameraCode)
//         {
//             var camera = await _camera.GetByAsync(c => c.cameraCode == cameraCode);

//             if (camera == null)
//                 return NotFound(new { message = "Camera not found" });

//             Console.WriteLine($"Camera Found: {camera.cameraCode}, Type: {camera.cameraType}, Address: {camera.cameraAddress}");

//             if (camera.cameraType == "IP")
//             {
//                 if (string.IsNullOrEmpty(camera.cameraAddress))
//                 {
//                     return BadRequest(new { message = "Camera address not found" });
//                 }

//                 // Tạm thời sử dụng file tạm nếu stream đang chạy live
//                 var hlsUrl = $"http://localhost:5023/hls/output.m3u8?t={DateTime.UtcNow.Ticks}";
//                 return Ok(new { streamUrl = hlsUrl });
//             }

//             return Ok(new { streamUrl = camera.rtspUrl });
//         }




//         [HttpPost("create")]
//         public async Task<IActionResult> Create([FromBody] Camera camera)
//         {
//             var response = await _camera.CreateAsync(camera);
//             return response.Flag ? Ok(response) : BadRequest(response);
//         }

//         [HttpPut("{id}")]
//         public async Task<IActionResult> UpdateCamera(Guid id, [FromBody] Camera camera)
//         {
//             if (id != camera.cameraId)
//             {
//                 return BadRequest(new Response(false, "Camera ID mismatch"));
//             }

//             var response = await _camera.UpdateAsync(camera);
//             return response.Flag ? Ok(response) : BadRequest(response);
//         }
//         [HttpDelete("{id}")]
//         public async Task<IActionResult> DeleteCamera(Guid id)
//         {
//             var camera = await _camera.GetByIdAsync(id);
//             if (camera == null)
//             {
//                 return NotFound(new Response(false, "Camera not found"));
//             }

//             var response = await _camera.DeleteAsync(camera);
//             return response.Flag ? Ok(response) : BadRequest(response);
//         }

//         [HttpGet("all")]
//         public async Task<IActionResult> GetAll()
//         {
//             var cameras = await _camera.GetAllAsync();
//             return Ok(cameras);
//         }

//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetById(Guid id)
//         {
//             var camera = await _camera.GetByIdAsync(id);
//             return camera != null ? Ok(camera) : NotFound(new { message = "Camera not found" });
//         }
//     }

// }
