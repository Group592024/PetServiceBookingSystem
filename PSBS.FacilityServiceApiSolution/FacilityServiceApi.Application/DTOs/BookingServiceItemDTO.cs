using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs
{
    public record BookingServiceItemDTO
    (
        Guid BookingServiceItemId,
        Guid BookingId,
        Guid ServiceVariantId,
        Guid PetId,
        decimal Price,
        DateTime CreateAt,
        DateTime UpdateAt 
    );
}
