using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public record AddBookingDTO
    (
        Guid AccountId,
        Guid PaymentTypeId,
        Guid? VoucherId,
        Guid BookingTypeId,
        Guid PointRuleId,
        decimal TotalAmount,
        string? Notes
    );
}
