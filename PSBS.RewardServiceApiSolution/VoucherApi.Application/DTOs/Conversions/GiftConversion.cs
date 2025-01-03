using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.DTOs.Conversions
{
    public static class GiftConversion
    {
        public static Gift ToEntity(GiftDTO giftDTO, string? imagePath = null) => new()
        {
            GiftId = giftDTO.giftId,
            GiftName = giftDTO.giftName,
            GiftDescription = giftDTO.giftDescription,
            GiftImage = imagePath ?? giftDTO.giftImage,
            GiftPoint = giftDTO.giftPoint,
            GiftCode = giftDTO.giftCode
        };

        public static (GiftDTO?, IEnumerable<GiftDTO>?) FromEntity(Gift gift, IEnumerable<Gift>? gifts)
        {
            //return single
            if (gift != null || gifts == null)
            {
                var singleGift = new GiftDTO
                    (
                        gift!.GiftId,
                        gift.GiftName,
                        gift.GiftDescription,
                        gift.GiftImage,
                        null,
                        gift.GiftPoint,
                        gift.GiftCode
                    );
                return (singleGift, null);
            }

            //return list
            if (gifts != null || gift == null)
            {
                var listGifts = gifts!.Select(g =>
                    new GiftDTO(g.GiftId, g.GiftName, g.GiftDescription, g.GiftImage, null,g.GiftPoint,g.GiftCode)).ToList();
                return (null, listGifts);
            }

            return (null, null);
        }
    }
}
