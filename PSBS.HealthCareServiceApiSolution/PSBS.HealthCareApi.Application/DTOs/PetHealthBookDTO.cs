using PSBS.HealthCareApi.Domain;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs
{
    public record PetHealthBookDTO(
      Guid? healthBookId,
      [Required] Guid BookingServiceItemId,
      DateTime visitDate,
      DateTime? nextVisitDate,
      [Required] string performBy,
      DateTime createdAt,
      DateTime? updatedAt,
      bool isDeleted,
      List<Guid> medicineIds
      );
}
