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
    Guid BookingId, 
    Guid AccountId, 
    Guid BookingStatusId, 
    Guid PaymentTypeId, 
    Guid VoucherId, 
    Guid BookingTypeId, 
    Guid PointRuleId, 
    decimal TotalAmount, 
    DateTime BookingDate,
    [Required] string Notes, 
    DateTime CreateAt,
    DateTime UpdateAt,
    [Required] bool isPaid
        );
}
