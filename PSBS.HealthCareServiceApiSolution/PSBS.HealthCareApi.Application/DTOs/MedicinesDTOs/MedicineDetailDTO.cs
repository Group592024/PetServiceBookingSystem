using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs
{
    public record MedicineDetailDTO
    (
        Guid medicineId,
        string treatmentName,
        string medicineName,
        string? medicineImage,
        bool medicineStatus
    );
}
