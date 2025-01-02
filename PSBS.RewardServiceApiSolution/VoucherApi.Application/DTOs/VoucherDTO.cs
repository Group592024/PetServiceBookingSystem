

using System;
using System.ComponentModel.DataAnnotations;
using System.Numerics;
using VoucherApi.Application.DTOs.CustomValidation;

namespace VoucherApi.Application.DTOs
{
    public record VoucherDTO
    (
        Guid Id,
        [Required]  string VoucherName,
        [Required] string VoucherDescription,
        [Required, Range(0, int.MaxValue)] int VoucherQuantity,
        [Required, Range(0, int.MaxValue)] int VoucherDiscount,
        [Required, Range(0, double.MaxValue)] decimal VoucherMaximum,
        [Required, Range(0, double.MaxValue)] decimal VoucherMinimumSpend,
        [Required] string VoucherCode,
         [Required, CustomDateValidation]
        DateTime VoucherStartDate,

        [Required, CompareDates(nameof(VoucherStartDate))]
        DateTime VoucherEndDate,
        [Required] bool isGift
    );
}
