using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs
{
    public record TreatmentDTO
    {
        public Guid treatmentId { get; set; }
        public string treatmentName { get; set; }
        public bool? isDeleted { get; set; }
    }
}
