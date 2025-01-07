

using System.ComponentModel.DataAnnotations;

namespace ReservationApi.Application.DTOs
{

    public record BookingTypeDTO(
   Guid BookingTypeId,
   [Required] string BookingTypeName,
    [Required] bool isDeleted
   );
}
