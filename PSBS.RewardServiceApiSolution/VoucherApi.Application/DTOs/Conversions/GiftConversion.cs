using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VoucherApi.Application.DTOs.GiftDTOs;
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
            GiftCode = giftDTO.giftCode,
            GiftQuantity = giftDTO.quantity
        };

        public static Gift ToEntityForUpdate(UpdateGiftDTO dto, string? imagePath = null) => new()
        {
            GiftId = dto.giftId,
            GiftName = dto.giftName,
            GiftDescription = dto.giftDescription,
            GiftImage = imagePath ?? dto.giftImage,
            GiftPoint = dto.giftPoint,
            GiftCode = dto.giftCode,
            GiftQuantity = dto.quantity,
            GiftStatus = dto.giftStatus
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
                        gift.GiftCode,
                        gift.GiftQuantity
                    );
                return (singleGift, null);
            }

            //return list
            if (gifts != null || gift == null)
            {
                var listGifts = gifts!.Select(g =>
                    new GiftDTO(g.GiftId, g.GiftName, g.GiftDescription, g.GiftImage, null,g.GiftPoint,g.GiftCode,g.GiftQuantity)).ToList();
                return (null, listGifts);
            }

            return (null, null);
        }

        public static (UpdateGiftDTO?, IEnumerable<UpdateGiftDTO>?) FromEntityWithStatus(Gift gift, IEnumerable<Gift>? gifts)
        {
            //return single
            if (gift != null || gifts == null)
            {
                var singleGift = new UpdateGiftDTO
                    (
                        gift!.GiftId,
                        gift.GiftName,
                        gift.GiftDescription,
                        gift.GiftImage,
                        null,
                        gift.GiftPoint,
                        gift.GiftCode,
                        gift.GiftQuantity,
                        gift.GiftStatus
                    );
                return (singleGift, null);
            }

            //return list
            if (gifts != null || gift == null)
            {
                var listGifts = gifts!.Select(g =>
                    new UpdateGiftDTO(g.GiftId, g.GiftName, g.GiftDescription, g.GiftImage, null, g.GiftPoint, g.GiftCode, g.GiftQuantity,g.GiftStatus)).ToList();
                return (null, listGifts);
            }

            return (null, null);
        }

        public static (AdminGiftListDTO?, IEnumerable<AdminGiftListDTO>?) FromEntityAdminListFormat(Gift gift, IEnumerable<Gift>? gifts)
        {
            //return single
            if (gift != null || gifts == null)
            {
                var singleGift = new AdminGiftListDTO
                    (
                        gift!.GiftId,
                        gift.GiftName,
                        gift.GiftImage,
                        gift.GiftCode,
                        gift.GiftStatus
                    );
                return (singleGift, null);
            }

            //return list
            if (gifts != null || gift == null)
            {
                var listGifts = gifts!.Select(g =>
                    new AdminGiftListDTO(g.GiftId, g.GiftName, g.GiftImage, g.GiftCode,g.GiftStatus)).ToList();
                return (null, listGifts);
            }

            return (null, null);
        }

        public static (CustomerGiftDTOs?, IEnumerable<CustomerGiftDTOs>?) FromEntityCustomerFormat(Gift gift, IEnumerable<Gift>? gifts)
        {
            //return single
            if (gift != null || gifts == null)
            {
                var singleGift = new CustomerGiftDTOs
                    (
                        gift!.GiftId,
                        gift.GiftName,
                        gift.GiftDescription,
                        gift.GiftImage,
                        gift.GiftPoint,
                        gift.GiftCode
                    );
                return (singleGift, null);
            }

            //return list
            if (gifts != null || gift == null)
            {
                var listGifts = gifts!.Select(g =>
                    new CustomerGiftDTOs(g.GiftId, g.GiftName, g.GiftDescription, g.GiftImage, g.GiftPoint, g.GiftCode)).ToList();
                return (null, listGifts);
            }

            return (null, null);
        }
    }
}
