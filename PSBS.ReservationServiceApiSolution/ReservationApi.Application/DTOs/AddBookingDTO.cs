using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public record AddBookingDTO
    (
        [Required]Guid AccountId,
        Guid PaymentTypeId,
        Guid? VoucherId,
        Guid BookingTypeId,
         Guid BookingStatusId,
        Guid? PointRuleId,
        decimal TotalAmount,
        string? Notes
    );
}
