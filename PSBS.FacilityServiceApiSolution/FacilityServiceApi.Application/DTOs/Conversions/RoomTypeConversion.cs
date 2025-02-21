using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Domain.Entities;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public static class RoomTypeConversion
    {
        public static RoomType ToEntity(RoomTypeDTO roomType)
        {
            return new RoomType()
            {
                roomTypeId = roomType.roomTypeId,
                name = roomType.name,
                price = roomType.price,
                description = roomType.description,
                isDeleted = roomType.isDeleted ?? false
            };
        }

        public static (RoomTypeDTO?, IEnumerable<RoomTypeDTO>?) FromEntity(RoomType? roomType, IEnumerable<RoomType>? roomTypes)
        {
            if (roomType is not null && roomTypes is null)
            {
                var singleRoomType = new RoomTypeDTO
                {
                    roomTypeId = roomType.roomTypeId,
                    name = roomType.name,
                    price = roomType.price,
                    description = roomType.description,
                    isDeleted = roomType.isDeleted,
                    
                };
                return (singleRoomType, null);
            }

            if (roomTypes is not null && roomType is null)
            {
                var _roomTypes = roomTypes.Select(rt => new RoomTypeDTO
                {
                    roomTypeId = rt.roomTypeId,
                    name = rt.name,
                    price = rt.price,
                    description = rt.description,
                    isDeleted = rt.isDeleted,
                    
                }).ToList();

                return (null, _roomTypes);
            }

            return (null, null);
        }
    }
}
