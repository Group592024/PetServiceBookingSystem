

using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace VoucherApi.Application.DTOs
{
    public record RedeemDetailDTO
   (
         Guid? RedeemHistoryId,
    [Required] string giftName,
    string? giftImage,  
    [Required] int giftPoint,
    string? giftCode,
    DateTime RedeemDate,
     Guid RedeemStatusId,
     string RedeemStatusName

        );
}
