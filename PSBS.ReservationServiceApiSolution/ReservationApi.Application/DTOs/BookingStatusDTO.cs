

using System.ComponentModel.DataAnnotations;

namespace ReservationApi.Application.DTOs
{
 
    public record BookingStatusDTO(
       Guid BookingStatusId,
       [Required] string BookingStatusName,
        [Required] bool isDeleted
       );
}
