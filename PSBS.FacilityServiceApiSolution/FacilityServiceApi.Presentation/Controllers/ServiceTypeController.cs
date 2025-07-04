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
    public class ServiceTypeController : ControllerBase
    {
        private readonly IServiceType _serviceType;

        public ServiceTypeController(IServiceType serviceTypeService)
        {
            _serviceType = serviceTypeService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceTypeDTO>>> GetServiceTypes()
        {
            var serviceTypes = await _serviceType.GetAllAsync();

            if (!serviceTypes.Any())
                return NotFound(new Response(false, "No service types found in the database"));

            var (_, responseData) = ServiceTypeConversion.FromEntity(null, serviceTypes);

            return Ok(new Response(true, "Service types retrieved successfully")
            {
                Data = responseData
            });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceTypeDTO>> GetServiceTypeById(Guid id)
        {
            var serviceType = await _serviceType.GetByIdAsync(id);
            if (serviceType == null)
            {
                return NotFound(new Response(false, $"ServiceType with ID {id} not found"));
            }

            var serviceTypeDto = new ServiceTypeDTO
            {
                serviceTypeId = serviceType.serviceTypeId,
                typeName = serviceType.typeName,
                createAt = serviceType.createAt,
                updateAt = serviceType.updateAt,
                description = serviceType.description,
                isDeleted = serviceType.isDeleted
            };

            return Ok(new Response(true, "ServiceType retrieved successfully")
            {
                Data = serviceTypeDto
            });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreateServiceType([FromBody] ServiceTypeDTO creatingServiceType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var newServiceTypeEntity = ServiceTypeConversion.ToEntity(creatingServiceType);
            var response = await _serviceType.CreateAsync(newServiceTypeEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdateServiceType([FromBody] ServiceTypeDTO updatingServiceType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var existingServiceType = await _serviceType.GetByIdAsync(updatingServiceType.serviceTypeId);
            if (existingServiceType == null)
            {
                return NotFound(new Response(false, $"ServiceType with ID {updatingServiceType.serviceTypeId} not found"));
            }

            var updatedServiceTypeEntity = ServiceTypeConversion.ToEntity(updatingServiceType);
            var response = await _serviceType.UpdateAsync(updatedServiceTypeEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeleteServiceType(Guid id)
        {
            var existingServiceType = await _serviceType.GetByIdAsync(id);
            if (existingServiceType == null)
            {
                return NotFound(new Response(false, $"ServiceType with ID {id} not found or already deleted"));
            }

            var response = await _serviceType.DeleteAsync(existingServiceType);

            return response.Flag
                ? Ok(response)
                : BadRequest(response);
        }

        [HttpGet("available")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceTypeDTO>>> GetAvailableServiceTypes()
        {
            var serviceTypes = await _serviceType.ListAvailableServiceTypeAsync();

            if (!serviceTypes.Any())
                return NotFound(new Response(false, "No available service types found in the database"));

            var (_, responseData) = ServiceTypeConversion.FromEntity(null, serviceTypes);

            return Ok(new Response(true, "Available service types retrieved successfully")
            {
                Data = responseData
            });
        }
    }
}
