using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs
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
