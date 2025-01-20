using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VoucherApi.Application.DTOs.CustomValidation;

namespace VoucherApi.Application.DTOs
{
   
    public record UpdateVoucherDTO
   (
       Guid voucherId,
       [Required] string VoucherName,
       [Required] string VoucherDescription,
       [Required, Range(0, int.MaxValue)] int VoucherQuantity,
       [Required, Range(0, int.MaxValue)] int VoucherDiscount,
       [Required, Range(0, double.MaxValue)] decimal VoucherMaximum,
       [Required, Range(0, double.MaxValue)] decimal VoucherMinimumSpend,
       [Required] string VoucherCode, 
        DateTime VoucherStartDate,
       [Required, CompareDates(nameof(VoucherStartDate))]
        DateTime VoucherEndDate,
       [Required] bool isGift,
        [Required] bool isDeleted
   );
}
