using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs
{
    public record PetHealthBookConvertDTO(
     Guid healthBookId,
     [Required] Guid BookingServiceItemId,
     List<Guid> medicineId,
     DateTime visitDate,
     DateTime? nextVisitDate,
     [Required] string performBy,
     DateTime createdAt,
     DateTime? updatedAt,
     bool isDeleted
     );
}
