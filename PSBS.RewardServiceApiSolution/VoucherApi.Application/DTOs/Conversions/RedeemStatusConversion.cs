

using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.DTOs.Conversions
{
    public class RedeemStatusConversion
    {
        public static RedeemStatus ToEntity(RedeemStatusDTO redeemStatusDTP)
        {
            return new RedeemStatus
            {
                ReddeemStautsId = redeemStatusDTP.RedeemStatusId,
                RedeemName = redeemStatusDTP.RedeemStatusName,
              
            };
        }
    }
}
