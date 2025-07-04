﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.DTOs.Conversions;
using PSBS.HealthCareApi.Application.Interfaces;
using PSPS.SharedLibrary.Responses;

namespace PSBS.HealthCareApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TreatmentController : ControllerBase
    {
        private readonly ITreatment _treatmentService;

        public TreatmentController(ITreatment treatmentService)
        {
            _treatmentService = treatmentService;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<IEnumerable<TreatmentDTO>>> GetTreatments()
        {
            var treatments = await _treatmentService.GetAllAsync();
            if (!treatments.Any())
                return NotFound(new Response(false, "No treatments found in the database"));

            var treatmentDtos = treatments.Select(treatment => new TreatmentDTO
            {
                treatmentId = treatment.treatmentId,
                treatmentName = treatment.treatmentName,
                isDeleted = treatment.isDeleted
            });

            return Ok(new Response(true, "Treatments retrieved successfully")
            {
                Data = treatmentDtos
            });
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<ActionResult<TreatmentDTO>> GetTreatmentById(Guid id)
        {
            var treatment = await _treatmentService.GetByIdAsync(id);
            if (treatment == null)
            {
                return NotFound(new Response(false, $"Treatment with ID {id} not found"));
            }

            var treatmentDto = new TreatmentDTO
            {
                treatmentId = treatment.treatmentId,
                treatmentName = treatment.treatmentName,
                isDeleted = treatment.isDeleted
            };

            return Ok(new Response(true, "Treatment retrieved successfully")
            {
                Data = treatmentDto
            });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> CreateTreatment([FromBody] TreatmentDTO creatingTreatment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var newTreatmentEntity = TreatmentConversion.ToEntity(creatingTreatment);
            var response = await _treatmentService.CreateAsync(newTreatmentEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpPut]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> UpdateTreatment([FromBody] TreatmentDTO updatingTreatment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var updatedTreatmentEntity = TreatmentConversion.ToEntity(updatingTreatment);
            var response = await _treatmentService.UpdateAsync(updatedTreatmentEntity);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<Response>> DeleteTreatment(Guid id)
        {
            var existingTreatment = await _treatmentService.GetByIdAsync(id);
            if (existingTreatment == null)
            {
                return NotFound(new Response(false, $"Treatment with ID {id} not found or already deleted"));
            }

            var response = await _treatmentService.DeleteAsync(existingTreatment);

            return response.Flag ? Ok(response) : BadRequest(response);
        }

        [HttpGet("available")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<IEnumerable<TreatmentDTO>>> GetAvailableTreatments()
        {
            var treatments = await _treatmentService.ListAvailableTreatmentAsync();
            if (!treatments.Any())
            {
                return NotFound(new Response(false, "No available rooms found"));
            }

            var (_, treatmentDtos) = TreatmentConversion.FromEntity(null!, treatments);
            return Ok(new Response(true, "Available rooms retrieved successfully")
            {
                Data = treatmentDtos
            });
        }

    }
}