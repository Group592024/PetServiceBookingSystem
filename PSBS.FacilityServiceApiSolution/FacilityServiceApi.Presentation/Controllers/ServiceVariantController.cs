using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceVariantController : ControllerBase
    {
        private readonly IServiceVariant _serviceVariant;
        private readonly IService _service;
        private readonly IBookingServiceItem _bookingService;

        public ServiceVariantController(IServiceVariant serviceVariant, IService service, IBookingServiceItem bookingService)
        {
            _serviceVariant = serviceVariant;
            _service = service;
            _bookingService = bookingService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceVariantDTO>> GetServiceVariantById(Guid id)
        {
            var serviceVariant = await _serviceVariant.GetByIdAsync(id);
            if (serviceVariant == null || serviceVariant.isDeleted)
            {
                return NotFound(new Response(false, $"Service variant with GUID {id} not found or is deleted"));
            }

            var (serviceVariantDto, _) = ServiceVariantConversion.FromEntity(serviceVariant, null!);
            return Ok(new Response(true, "Service variant retrieved successfully")
            {
                Data = serviceVariantDto
            });
        }

        [HttpGet("/service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<ServiceVariantDTO>>> GetServiceVariantListById(Guid serviceId)
        {
            var service = await _service.GetByIdAsync(serviceId);
            if (service == null || service.isDeleted)
            {
                return NotFound(new Response(false, $"Service with GUID {serviceId} not found or is deleted"));
            }

            var serviceVariants = (await _serviceVariant.GetAllVariantsAsync(serviceId))
                        .Where(r => !r.isDeleted)
                        .ToList();
            if (!serviceVariants.Any())
            {
                return NotFound(new Response(false, "No service variants found in the database"));
            }

            var (_, serviceVariantDtos) = ServiceVariantConversion.FromEntity(null!, serviceVariants);
            return Ok(new Response(true, "Service variants retrieved successfully")
            {
                Data = serviceVariantDtos
            });
        }


        [HttpPost]
        public async Task<ActionResult<Response>> CreateServiceVariant([FromForm] CreateServiceVariantDTO serviceVariant)
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

            var service = await _service.GetByIdAsync(serviceVariant.serviceId);
            if (service == null)
            {
                return NotFound(new Response(false, $"Service with ID {serviceVariant.serviceId} not found"));
            }

            var existingVariant = await _serviceVariant.GetByAsync(x => x.serviceId == serviceVariant.serviceId && x.serviceContent.ToLower().Trim().Equals(serviceVariant.serviceContent.ToLower().Trim()));
            if (existingVariant != null)
            {
                return Conflict(new Response(false, $"Service variant with content {existingVariant.serviceContent} is already existed"));
            }

            var getEntity = ServiceVariantConversion.ToEntity(serviceVariant);

            var response = await _serviceVariant.CreateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id:Guid}")]
        public async Task<ActionResult<Response>> UpdateServiceVariant([FromRoute] Guid id, [FromForm] UpdateServiceVariantDTO dto)
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

            var existingServiceVariant = await _serviceVariant.GetByIdAsync(id);
            if (existingServiceVariant == null || existingServiceVariant.isDeleted)
                return NotFound(new Response(false, $"Service variant with ID {id} not found"));

            bool hasChanges =
                existingServiceVariant.servicePrice != dto.servicePrice ||
                existingServiceVariant.serviceContent != dto.serviceContent;

            if (!hasChanges)
            {
                return NoContent();
            }

            var existingVariant = await _serviceVariant.GetByAsync(x => x.serviceId == existingServiceVariant.serviceId && x.serviceContent.ToLower().Trim().Equals(dto.serviceContent.ToLower().Trim()));
            if (existingVariant != null)
            {
                return Conflict(new Response(false, $"Service variant with content {existingVariant.serviceContent} is already existed"));
            }

            // Chuyển đổi và cập nhật
            var updatedEntity = ServiceVariantConversion.ToEntity(dto);
            updatedEntity.serviceVariantId = id;
            updatedEntity.serviceId = existingServiceVariant.serviceId;
            updatedEntity.createAt = existingServiceVariant.createAt;
            updatedEntity.updateAt = DateTime.Now;

            var response = await _serviceVariant.UpdateAsync(updatedEntity);

            if (!response.Flag)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpDelete("{id:Guid}")]
        public async Task<ActionResult<Response>> DeleteServiceVariant(Guid id)
        {
            var existingVariant = await _serviceVariant.GetByIdAsync(id);
            if (existingVariant == null)
                return NotFound(new Response(false, $"Service variant with ID {id} not found"));
            Response response;
            var checkVariant = await _bookingService.CheckIfVariantHasBooking(id);

            if (!existingVariant.isDeleted)
            {
                response = await _serviceVariant.DeleteAsync(existingVariant);
                return response.Flag ? Ok(response) : BadRequest(response);
            }
            else
            {
                if (!checkVariant)
                {
                    response = await _serviceVariant.DeleteSecondAsync(existingVariant);
                    return response.Flag ? Ok(response) : BadRequest(response);
                }
                else
                {
                    return Conflict(new Response(false, "Can't delete this service variant because it is in at least booking."));
                }

            }
        }
    }
}
