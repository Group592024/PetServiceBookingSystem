using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs
{
    public record CreateBookingServiceItemDTO
    (
    Guid BookingId,
    Guid ServiceVariantId,
    Guid PetId,
    decimal Price
    );
}
