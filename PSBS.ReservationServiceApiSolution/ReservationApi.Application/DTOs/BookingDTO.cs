using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public record BookingDTO
    (
     Guid BookingId,
     String? BookingCode,
     Guid AccountId,
     Guid BookingStatusId,
     Guid PaymentTypeId,
     Guid? VoucherId,
     Guid BookingTypeId,
     Guid? PointRuleId,
     decimal TotalAmount,
     DateTime BookingDate,
     string? Notes,
     DateTime? CreateAt,
     DateTime? UpdateAt,
     bool isPaid
    );
}