using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VoucherApi.Application.DTOs.GiftDTOs
{
    public record UpdateGiftDTO
    (
    Guid giftId,
    [Required] string giftName,
    string? giftDescription,
    string? giftImage,
    IFormFile? imageFile,
    [Required] int giftPoint,
    string? giftCode,
    int quantity,
    bool giftStatus
    );
}
