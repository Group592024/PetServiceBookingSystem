using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public record BookingDTO(
   [Required] Guid BookingId,
   [Required] Guid AccountId,
   [Required] Guid BookingStatusId,
   [Required] Guid PaymentTypeId,
   [Required] Guid VoucherId,
   [Required] Guid BookingTypeId,
   [Required] Guid PointRuleId,
    decimal TotalAmount,
    DateTime BookingDate,
    string Notes,
    DateTime CreateAt,
    DateTime UpdateAt, 
    bool isPaid);
         
}
