using Microsoft.AspNetCore.Mvc;
using PSBS.HealthCareApi.Application.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Collections.Generic;
using PSPS.SharedLibrary.Responses;
using PSBS.HealthCareApi.Application.DTOs.Conversions;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs;
using PSBS.HealthCareApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PSBS.HealthCareApi.Presentation.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MedicinesController : ControllerBase
    {
        private readonly IMedicine _medicineInterface;
        private readonly HealthCareDbContext _context;
        public MedicinesController(IMedicine medicineInterface, HealthCareDbContext context)
        {
            _medicineInterface = medicineInterface;
            _context = context;
        }
        // GET: <MedicinesController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicineDTO>>> GetMedicinesList()
        {
            var medicines = await _medicineInterface.GetAllAsync();
            if (!medicines.Any())
            {
                return NotFound(new Response(false, "No medicines detected"));
            }
            var (_, listMedicines) = MedicineConversion.FromEntity(null!, medicines);

            return Ok(new Response(true, "Medicines retrieved successfully!")
            {
                Data = listMedicines
            });
        }

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<MedicineDTO>>> GetMedicinesListAllAttribute()
        {
            var medicines = await _medicineInterface.GetAllAttributeAsync();
            if (!medicines.Any())
            {
                return NotFound(new Response(false, "No medicines detected"));
            }
            var (_, listMedicines) = MedicineConversion.FromEntityAdmList(null!, medicines);

            return Ok(new Response(true, "Medicines retrieved successfully!")
            {
                Data = listMedicines
            });
        }

        // GET <MedicinesController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicineDetailDTO>> GetMedicineById(Guid id)
        {
            var medicine = await _medicineInterface.GetByIdAsync(id);
            if (medicine == null)
            {
                return NotFound(new Response(false, "The medicine requested not found"));
            }

            var treatment = await _context.Treatments.FirstOrDefaultAsync(t => t.treatmentId == medicine.treatmentId && !t.isDeleted);
            MedicineDetailDTO detailDTO = new MedicineDetailDTO(medicine.medicineId, treatment.treatmentName, medicine.medicineName,medicine.medicineImage);
            return Ok(new Response(true, "The medicine retrieved successfully")
            {
                Data = detailDTO
            });
        }

        // POST <MedicinesController>
        [HttpPost]
        public async Task<ActionResult<Response>> CreateMedicine([FromForm] MedicineDTO creattingMedicine)
        {
            ModelState.Remove(nameof(MedicineDTO.medicineId));
            if (creattingMedicine.imageFile == null)
            {
                ModelState.AddModelError("imageFile", "Please upload a image for medicine");
            }
            if (creattingMedicine.treatmentId == null)
            {
                ModelState.AddModelError("treatmentId", "Please enter a treatment for medicine");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Fail input") { Data = ModelState });
            }

            string? imagePath = null;
            if (creattingMedicine.imageFile != null && creattingMedicine.imageFile.Length > 0)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(creattingMedicine.imageFile.FileName);
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImageMedicines");
                var fullPath = Path.Combine(folderPath, fileName);

                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await creattingMedicine.imageFile.CopyToAsync(stream);
                }

                imagePath = $"/ImageMedicines/{fileName}";
            }
            var medicine = MedicineConversion.ToEntity(creattingMedicine, imagePath);
            var response = await _medicineInterface.CreateAsync(medicine);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // PUT <MedicinesController>/5
        [HttpPut]
        public async Task<ActionResult<Response>> UpdateMedicine([FromForm] MedicineDTO updateMedicine)
        {
            ModelState.Remove(nameof(MedicineDTO.medicineId));
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Fail input") { Data = ModelState });
            }
            var existingMedicine = await _medicineInterface.GetByIdAsync(updateMedicine.medicineId);
            if (existingMedicine == null)
            {
                return NotFound(new Response(false, "The medicine is not found!"));
            }


            var getEntity = MedicineConversion.ToEntity(updateMedicine);
            if (updateMedicine.imageFile != null && updateMedicine.imageFile.Length > 0)
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), existingMedicine.medicineImage.TrimStart('/'));

                if (!string.IsNullOrEmpty(existingMedicine.medicineImage) && System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
                //save the new image
                var newFileName = Guid.NewGuid() + Path.GetExtension(updateMedicine.imageFile.FileName);
                var newFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImageMedicines");
                var newFullPath = Path.Combine(newFolderPath, newFileName);

                if (!Directory.Exists(newFolderPath))
                {
                    Directory.CreateDirectory(newFolderPath);
                }
                using (var stream = new FileStream(newFullPath, FileMode.Create))
                {
                    await updateMedicine.imageFile.CopyToAsync(stream);
                }
                getEntity.medicineImage = $"/ImageMedicines/{newFileName}";
            }
            else
            {
                getEntity.medicineImage = existingMedicine.medicineImage;
            }
            var response = await _medicineInterface.UpdateAsync(getEntity);
            return response.Flag ? Ok(response) : BadRequest(response);
        }

        // DELETE <MedicinesController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeleteMedicine(Guid id)
        {
            var existingMedicine = await _medicineInterface.GetByIdAsync(id);
            if(existingMedicine == null)
            {
                return NotFound(new Response(false, "The medicine is not found!"));
            }
            var response = await _medicineInterface.DeleteAsync(existingMedicine);
            return response.Flag ? response : response;
        }
    }
}
