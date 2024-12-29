using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public static class RoomConversion
    {
        public static Room ToEntity(RoomDTO room)
        {
            return new Room()
            {
                roomId = room.roomId,
                roomTypeId = room.roomTypeId,
                description = room.description,
                status = room.status,
                isDeleted = false,
                roomImage = room.roomImage,
                hasCamera = room.hasCamera
            };
        }

        public static (RoomDTO?, IEnumerable<RoomDTO>?) FromEntity(Room? room, IEnumerable<Room>? rooms)
        {
            //return single
            if (room is not null && rooms is null)
            {
                var singleRoom = new RoomDTO
                {
                    roomId = room.roomId,
                    roomTypeId = room.roomTypeId,
                    description = room.description,
                    status = room.status,
                    roomImage = room.roomImage,
                    hasCamera = room.hasCamera
                };
                return (singleRoom, null);
            }

            //return list
            if (rooms is not null && room is null)
            {
                var _rooms = rooms.Select(p => new RoomDTO
                {
                    roomId = p.roomId,
                    roomTypeId = p.roomTypeId,
                    description = p.description,
                    status = p.status,
                    roomImage = p.roomImage,
                    hasCamera = p.hasCamera,
                }).ToList();

                return (null, _rooms);
            }

            return (null, null);
        }
    }
}
