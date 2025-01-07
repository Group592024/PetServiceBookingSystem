using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.DTOs.Conversions;
using PSBS.HealthCareApi.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PSBS.HealthCareApi.Application.DTOs.Conversions.PSBS.HealthCareApi.Application.DTOs.Conversions;

namespace PSBS.HealthCareApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TreatmentController : ControllerBase
    {
        private readonly ITreatment _treatmentService;

        public TreatmentController(ITreatment treatmentService)
        {
            _treatmentService = treatmentService;
        }

        [HttpGet]
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
        public async Task<ActionResult<Response>> CreateTreatment([FromForm] TreatmentDTO creatingTreatment)
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
        public async Task<ActionResult<Response>> UpdateTreatment([FromForm] TreatmentDTO updatingTreatment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            var existingTreatment = await _treatmentService.GetByIdAsync(updatingTreatment.treatmentId);
            if (existingTreatment == null)
            {
                return NotFound(new Response(false, $"Treatment with ID {updatingTreatment.treatmentId} not found"));
            }

            var updatedTreatmentEntity = TreatmentConversion.ToEntity(updatingTreatment);
            var response = await _treatmentService.UpdateAsync(updatedTreatmentEntity);

            return response.Flag ? Ok(response) : BadRequest(new Response(false, "Failed to update the Treatment"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeleteTreatment(Guid id)
        {
            var existingTreatment = await _treatmentService.GetByIdAsync(id);
            if (existingTreatment == null)
            {
                return NotFound(new Response(false, $"Treatment with ID {id} not found or already deleted"));
            }

            var response = await _treatmentService.DeleteAsync(existingTreatment);

            return response.Flag
                ? Ok(response)
                : BadRequest(response);
        }

        [HttpGet("available")]
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