using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.DTOs.Conversions
{
    public static class RedeemGiftHistoryConversion
    {
        public static RedeemGiftHistory ToEntity(RedeemGiftHistoryDTO redeemGiftHistoryDTO)
        {
            return new RedeemGiftHistory
            {
                RedeemHistoryId = redeemGiftHistoryDTO.RedeemHistoryId,
                GiftId = redeemGiftHistoryDTO.GiftId,
                AccountId = redeemGiftHistoryDTO.AccountId,
                RedeemPoint = redeemGiftHistoryDTO.RedeemPoint,
                RedeemDate = redeemGiftHistoryDTO.RedeemDate
            };
        }

        public static (RedeemGiftHistoryDTO?, IEnumerable<RedeemGiftHistoryDTO>?) FromEntity(
            RedeemGiftHistory? redeemGiftHistory,
            IEnumerable<RedeemGiftHistory>? redeemGiftHistories)
        {
            // Return single entity
            if (redeemGiftHistory is not null && redeemGiftHistories is null)
            {
                var singleRedeemGiftHistoryDTO = new RedeemGiftHistoryDTO
                {
                    RedeemHistoryId = redeemGiftHistory.RedeemHistoryId,
                    GiftId = redeemGiftHistory.GiftId,
                    AccountId = redeemGiftHistory.AccountId,
                    RedeemPoint = redeemGiftHistory.RedeemPoint,
                    RedeemDate = redeemGiftHistory.RedeemDate
                };
                return (singleRedeemGiftHistoryDTO, null);
            }

            // Return list of entities
            if (redeemGiftHistories is not null && redeemGiftHistory is null)
            {
                var redeemGiftHistoryDTOs = redeemGiftHistories.Select(r => new RedeemGiftHistoryDTO
                {
                    RedeemHistoryId = r.RedeemHistoryId,
                    GiftId = r.GiftId,
                    AccountId = r.AccountId,
                    RedeemPoint = r.RedeemPoint,
                    RedeemDate = r.RedeemDate
                }).ToList();

                return (null, redeemGiftHistoryDTOs);
            }

            return (null, null);
        }
    }
}
