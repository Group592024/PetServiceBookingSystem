﻿using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<ServiceVariantDTO>> GetServiceVariantById(Guid id)
        {
            var serviceVariant = await _serviceVariant.GetByIdAsync(id);
            if (serviceVariant == null)
            {
                return NotFound(new Response(false, $"Service variant with GUID {id} not found or is deleted"));
            }

            var (serviceVariantDto, _) = ServiceVariantConversion.FromEntity(serviceVariant, null!);
            return Ok(new Response(true, "Service variant retrieved successfully")
            {
                Data = serviceVariantDto
            });
        }


        [HttpGet("service/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceVariantDTO>>> GetServiceVariantListById(Guid id, [FromQuery] bool showAll)
        {
            if (showAll)
            {
                var service = await _service.GetByIdAsync(id);
                if (service == null)
                {
                    return NotFound(new Response(false, $"Service with GUID {id} not found or is deleted"));
                }

                var serviceVariants = (await _serviceVariant.GetAllVariantsAsync(id))

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
            else
            {
                var service = await _service.GetByIdAsync(id);
                if (service == null)
                {
                    return NotFound(new Response(false, $"Service with GUID {id} not found or is deleted"));
                }

                var serviceVariants = (await _serviceVariant.GetAllVariantsAsync(id))
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
        }


        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
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
        [Authorize(Policy = "AdminOrStaff")]
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
            if (existingServiceVariant == null)
                return NotFound(new Response(false, $"Service variant with ID {id} not found"));

            bool hasChanges =
                existingServiceVariant.servicePrice != dto.servicePrice ||
                existingServiceVariant.serviceContent != dto.serviceContent ||
                existingServiceVariant.isDeleted != dto.isDeleted;

            if (!hasChanges)
            {
                return NoContent();
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
        [Authorize(Policy = "AdminOrStaff")]
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
        [HttpGet("all")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceVariantDTO>>> GetAllServiceVariants()
        {
            try
            {
                var serviceVariants = await _serviceVariant.GetAllAsync(); 
                if (serviceVariants == null || !serviceVariants.Any())
                {
                    return NotFound(new Response(false, "No service variants found"));
                }

                var (_, serviceVariantDtos) = ServiceVariantConversion.FromEntity(null!, serviceVariants.ToList());
                return Ok(new Response(true, "Service variants retrieved successfully")
                {
                    Data = serviceVariantDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response(false, "Error occurred retrieving service variants"));
            }
        }

    }
}
