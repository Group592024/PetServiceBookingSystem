using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Application.Jobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using Quartz;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ServiceController : ControllerBase
    {
        private readonly IService _service;
        private readonly IServiceType _serviceType;
        private readonly IServiceVariant _serviceVariant;
        private readonly ISchedulerFactory _schedulerFactory;


        public ServiceController(IService service, IServiceType serviceType, IServiceVariant serviceVariant, ISchedulerFactory schedulerFactory)
        {
            _service = service;
            _serviceType = serviceType;
            _serviceVariant = serviceVariant;
            _schedulerFactory = schedulerFactory;
        }

        [HttpGet("serviceTypes")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceTypeDTO>>> GetServiceTypes()
        {
            var serviceTypes = await _serviceType.GetAllAsync();
            if (!serviceTypes.Any())
                return NotFound(new Response(false, "No service types found in the database"));

            var serviceTypeDtos = serviceTypes.Select(serviceType => new ServiceTypeDTO
            {
                serviceTypeId = serviceType.serviceTypeId,
                typeName = serviceType.typeName,
                createAt = serviceType.createAt,
                updateAt = serviceType.updateAt,
                description = serviceType.description
            });

            return Ok(new Response(true, "Service types retrieved successfully")
            {
                Data = serviceTypeDtos
            });
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceDTO>>> GetServicesList([FromQuery] bool showAll)
        {
            if (showAll)
            {
                var services = (await _service.GetAllAsync())
                        .ToList();
                if (!services.Any())
                {
                    return NotFound(new Response(false, "No services found in the database"));
                }

                var (_, serviceDtos) = ServiceConversion.FromEntity(null!, services);
                return Ok(new Response(true, "Services retrieved successfully")
                {
                    Data = serviceDtos
                });
            }
            else
            {
                var services = (await _service.GetAllAsync())
                        .Where(r => !r.isDeleted)
                        .ToList();
                if (!services.Any())
                {
                    return NotFound(new Response(false, "No services found in the database"));
                }

                var (_, serviceDtos) = ServiceConversion.FromEntity(null!, services);
                return Ok(new Response(true, "Services retrieved successfully")
                {
                    Data = serviceDtos
                });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceDTO>> GetServiceById(Guid id)
        {
            var service = await _service.GetByIdAsync(id);
            if (service == null)
            {
                return NotFound(new Response(false, $"Service with GUID {id} not found or is deleted"));
            }

            var (serviceDto, _) = ServiceConversion.FromEntity(service, null!);
            return Ok(new Response(true, "Service retrieved successfully")
            {
                Data = serviceDto
            });
        }

        [HttpPost("upload-image/{id:Guid}")]
        [AllowAnonymous]

        public async Task<ActionResult<Response>> UploadImage(Guid id, IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return BadRequest("No image file provided");

            var existingService = await _service.GetByIdAsync(id);
            if (existingService == null)
                return NotFound($"Service with ID {id} not found");

            var imagePath = Path.Combine("images", imageFile.FileName);
            using (var stream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            existingService.serviceImage = $"/images/{imageFile.FileName}";
            var response = await _service.UpdateAsync(existingService);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreateService([FromForm] CreateServiceDTO service, IFormFile imageFile)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(ms => ms.Value.Errors.Any())
                    .SelectMany(ms => ms.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();

                string errorString = string.Join("; ", errors);

                return BadRequest(new Response(false, errorString));
            }

            var serviceType = await _serviceType.GetByIdAsync(service.serviceTypeId);
            if (serviceType == null)
            {
                return NotFound(new Response(false, $"Service Type with ID {service.serviceTypeId} not found"));
            }

            string imagePath = await HandleImageUpload(imageFile);
            if (imagePath == null)
            {
                return BadRequest(new Response(false, "The uploaded file failed"));
            }

            var existingVariant = await _service.GetByAsync(x => x.serviceName.ToLower().Trim().Equals(service.serviceName.ToLower().Trim()));
            if (existingVariant != null)
            {
                return Conflict(new Response(false, $"Service with name {existingVariant.serviceName} is already existed"));
            }

            var getEntity = ServiceConversion.ToEntity(service, imagePath);

            var response = await _service.CreateAsync(getEntity);

            if (response.Flag == true)
            {
                var scheduler = await _schedulerFactory.GetScheduler();

                var jobDetail = JobBuilder.Create<DeleteServiceJob>()
                    .WithIdentity($"DeleteServiceJob-{getEntity.serviceId}")
                    .UsingJobData("ServiceId", getEntity.serviceId)
                    .Build();

                var trigger = TriggerBuilder.Create()
                    .WithIdentity($"DeleteServiceTrigger-{getEntity.serviceId}")
                    .StartAt(DateTimeOffset.Now.AddMinutes(3))
                    .Build();

                await scheduler.ScheduleJob(jobDetail, trigger);
            }

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id:Guid}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdateService([FromRoute] Guid id, [FromForm] UpdateServiceDTO pet, IFormFile? imageFile = null)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                   .Where(ms => ms.Value.Errors.Any())
                   .SelectMany(ms => ms.Value.Errors.Select(e => e.ErrorMessage))
                   .ToList();

                string errorString = string.Join("; ", errors);

                return BadRequest(new Response(false, errorString));
            }

            var existingService = await _service.GetByIdAsync(id);
            if (existingService == null)
                return NotFound(new Response(false, $"Service with ID {id} not found"));

            bool hasChanges =
                existingService.serviceTypeId != pet.serviceTypeId ||
                existingService.serviceDescription != pet.serviceDescription ||
                existingService.serviceName != pet.serviceName ||
                existingService.isDeleted != pet.isDeleted ||
                imageFile != null;

            if (!hasChanges)
            {
                return NoContent();
            }

            //bool variantInBooking = await _service.CheckIfServiceHasVariantInBooking(id);


            // Xử lý hình ảnh
            string? imagePath = existingService.serviceImage; // Giữ nguyên đường dẫn cũ nếu không có tệp mới
            if (imageFile != null)
            {
                imagePath = await HandleImageUpload(imageFile, existingService.serviceImage);
            }

            // Chuyển đổi và cập nhật
            var updatedEntity = ServiceConversion.ToEntity(pet, imagePath);
            updatedEntity.serviceId = id;
            updatedEntity.updateAt = DateTime.Now;

            var response = await _service.UpdateAsync(updatedEntity);

            if (!response.Flag)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        private async Task<string?> HandleImageUpload(IFormFile imageFile, string? existingImagePath = null)
        {
            if (imageFile != null && imageFile.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLower();

                if (!allowedExtensions.Contains(fileExtension))
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
        public async Task<ActionResult<Response>> DeleteService(Guid id)
        {
            var existingService = await _service.GetByIdAsync(id);
            if (existingService == null)
                return NotFound($"Service with ID {id} not found");
            Response response;
            var checkService = await _serviceVariant.CheckIfServiceHasVariant(id);

            if (!existingService.isDeleted)
            {
                response = await _service.DeleteAsync(existingService);
                var deleteVariant = await _serviceVariant.DeleteByServiceIdAsync(id);
                return response.Flag ? Ok(response) : BadRequest(response);
            }
            else
            {
                if (!checkService)
                {
                    response = await _service.DeleteSecondAsync(existingService);
                    return response.Flag ? Ok(response) : BadRequest(response);
                }
                else
                {
                    return Conflict(new Response(false, "Can't delete this service because it has at least service variant."));
                }

            }
        }
    }
}
