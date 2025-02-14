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
     Guid bookingId,
     String? bookingCode,
     Guid accountId,
     Guid bookingStatusId,
     Guid paymentTypeId,
     Guid? voucherId,
     Guid bookingTypeId,
     Guid? pointRuleId,
     decimal totalAmount,
     DateTime bookingDate,
     string? notes,
     DateTime? createAt,
     DateTime? updateAt,
     bool isPaid
    );
}