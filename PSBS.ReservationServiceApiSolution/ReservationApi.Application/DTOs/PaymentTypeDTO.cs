

using System.ComponentModel.DataAnnotations;

namespace ReservationApi.Application.DTOs
{
    public record PaymentTypeDTO(
      Guid PaymentTypeId,
      [Required] string PaymentTypeName,
       [Required] bool isDeleted
      );
}
