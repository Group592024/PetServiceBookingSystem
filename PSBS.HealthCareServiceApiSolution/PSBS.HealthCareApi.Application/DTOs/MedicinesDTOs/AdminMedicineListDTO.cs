using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs
{
    public record AdminMedicineListDTO
    (Guid medicineId,
      [Required] Guid treatmentId,
      [Required] string medicineName,
      string? medicineImage,
      bool isDeleted
    );
}
