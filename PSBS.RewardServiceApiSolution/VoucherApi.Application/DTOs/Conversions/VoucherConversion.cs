

using System.Net.Http.Headers;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.DTOs.Conversions
{
    public static class VoucherConversion
    {
        public static Voucher ToEntity(VoucherDTO voucherDTO) => new()
        {
            VoucherId = voucherDTO.Id,
            VoucherName = voucherDTO.VoucherName,
            VoucherDescription = voucherDTO.VoucherDescription,
            VoucherQuantity = voucherDTO.VoucherQuantity,
            VoucherDiscount = voucherDTO.VoucherDiscount,
            VoucherMaximum = voucherDTO.VoucherMaximum,
            VoucherMinimumSpend = voucherDTO.VoucherMinimumSpend,
            VoucherCode = voucherDTO.VoucherCode,
            VoucherStartDate = voucherDTO.VoucherStartDate,
            VoucherEndDate = voucherDTO.VoucherEndDate,
            IsDeleted = false
        };
        public static (VoucherDTO?, IEnumerable<VoucherDTO>?) FromEntity(Voucher voucher, IEnumerable<Voucher>? vouchers)
        {
            if(voucher is not null || vouchers is null)
            {
                var singleVoucher = new VoucherDTO(
                    voucher!.VoucherId,
                    voucher.VoucherName,
                    voucher.VoucherDescription!,
                    voucher.VoucherQuantity,
                    voucher.VoucherDiscount,
                    voucher.VoucherMaximum,
                    voucher.VoucherMinimumSpend,
                    voucher.VoucherCode,
                    voucher.VoucherStartDate,
                    voucher.VoucherEndDate, 
                    voucher.IsGift
                    );
                return (singleVoucher, null);
            }
            if(voucher is null || vouchers is not null)
            {
                var list = vouchers!.Select(p=>
                new VoucherDTO(
                     p!.VoucherId,
                    p.VoucherName,
                    p.VoucherDescription!,
                    p.VoucherQuantity,
                    p.VoucherDiscount,
                    p.VoucherMaximum,
                    p.VoucherMinimumSpend,
                    p.VoucherCode,
                    p.VoucherStartDate,
                    p.VoucherEndDate,
                    p.IsGift
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
