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
                RedeemDate = redeemGiftHistoryDTO.RedeemDate,
                ReddeemStautsId= redeemGiftHistoryDTO.RedeemStatusId
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
                    RedeemDate = redeemGiftHistory.RedeemDate,
                    RedeemStatusName = redeemGiftHistory.RedeemStatus.RedeemName,
                    RedeemStatusId = redeemGiftHistory.ReddeemStautsId
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
                    RedeemDate = r.RedeemDate,
                    RedeemStatusName = r.RedeemStatus.RedeemName,
                    RedeemStatusId = r.ReddeemStautsId
                }).ToList();

                return (null, redeemGiftHistoryDTOs);
            }

            return (null, null);
        }
        public static (RedeemDetailDTO?, IEnumerable<RedeemDetailDTO>?) FromEntityToRedeemDetailDTO(
    RedeemGiftHistory? redeemGiftHistory,
    IEnumerable<RedeemGiftHistory>? redeemGiftHistories)
        {
            // Return single entity
            if (redeemGiftHistory is not null && redeemGiftHistories is null)
            {
                var singleRedeemGiftHistoryDTO = new RedeemDetailDTO(
                    RedeemHistoryId: redeemGiftHistory.RedeemHistoryId,  // Ensure correct argument name
                    giftName: redeemGiftHistory.Gift.GiftName ?? "Unknown",
                    giftImage: redeemGiftHistory.Gift.GiftImage,
                    giftPoint: redeemGiftHistory.Gift.GiftPoint,
                    giftCode: redeemGiftHistory.Gift.GiftCode,
                    RedeemDate: redeemGiftHistory.RedeemDate,
                    RedeemStatusId: redeemGiftHistory.ReddeemStautsId,
                    RedeemStatusName: redeemGiftHistory.RedeemStatus.RedeemName ?? "Unknown"
                );

                return (singleRedeemGiftHistoryDTO, null);
            }

            // Return list of entities
            if (redeemGiftHistories is not null && redeemGiftHistory is null)
            {
                var redeemGiftHistoryDTOs = redeemGiftHistories.Select(r => new RedeemDetailDTO(
                    RedeemHistoryId: r.RedeemHistoryId,  // Ensure correct argument name
                    giftName: r.Gift.GiftName ?? "Unknown",
                    giftImage: r.Gift.GiftImage,
                    giftPoint: r.Gift.GiftPoint,
                    giftCode: r.Gift.GiftCode,
                    RedeemDate: r.RedeemDate,
                    RedeemStatusId: r.ReddeemStautsId,
                    RedeemStatusName: r.RedeemStatus.RedeemName ?? "Unknown"
                )).ToList();

                return (null, redeemGiftHistoryDTOs);
            }

            return (null, null);
        }

    }
}
