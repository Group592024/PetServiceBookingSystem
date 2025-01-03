using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VoucherApi.Application.DTOs
{
    public record GiftDTO
    (
    Guid giftId,
    string giftName,
    string? giftDescription,
    string? giftImage,
    IFormFile? imageFile,
    int giftPoint,
    string? giftCode
    );
}
