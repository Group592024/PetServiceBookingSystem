using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VoucherApi.Application.DTOs.GiftDTOs
{
    public record AdminGiftListDTO
    (Guid giftId,
    [Required] string giftName,
    string? giftImage,
    string? giftCode,
    bool giftStatus
    );

}
