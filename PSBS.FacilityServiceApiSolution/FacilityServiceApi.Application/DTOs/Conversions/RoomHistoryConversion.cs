using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public static class RoomHistoryConversion
    {
        public static RoomHistory ToEntity(RoomHistoryDTO roomHistory)
        {
            return new RoomHistory()
            {
                RoomHistoryId = roomHistory.roomHistoryId,
                PetId = roomHistory.petId,
                RoomId = roomHistory.roomId,
                BookingId = roomHistory.bookingId,
                CameraId = roomHistory.cameraId,
                Status = roomHistory.status,
                CheckInDate = roomHistory.checkInDate,
                CheckOutDate = roomHistory.checkOutDate,
                BookingStartDate = roomHistory.bookingStartDate,
                BookingEndDate = roomHistory.bookingEndDate,
                BookingCamera = roomHistory.bookingCamera
            };
        }
        public static RoomHistory ToEntityForCreate(CreateRoomHistoryDTO createRoomHistoryDTO)
        {
            return new RoomHistory()
            {
                RoomHistoryId = Guid.Empty,
                PetId = createRoomHistoryDTO.PetId,
                RoomId = createRoomHistoryDTO.RoomId,
                BookingId = createRoomHistoryDTO.BookingId,
                CameraId = null,
                Status = "Pending",
                CheckInDate = null,
                CheckOutDate = null,
                BookingStartDate = createRoomHistoryDTO.BookingStartDate,
                BookingEndDate = createRoomHistoryDTO.BookingEndDate,
                BookingCamera = createRoomHistoryDTO.BookingCamera
            };
        }
        public static (RoomHistoryDTO?, IEnumerable<RoomHistoryDTO>?) FromEntity(RoomHistory? roomHistory, IEnumerable<RoomHistory>? roomHistories)
        {
            if (roomHistory is not null && roomHistories is null)
            {
                var singleRoomHistory = new RoomHistoryDTO
                (
                    roomHistory.RoomHistoryId,
                    roomHistory.PetId,
                    roomHistory.RoomId,
                    roomHistory.BookingId,
                    roomHistory.CameraId,
                    roomHistory.Status,
                    roomHistory.CheckInDate,
                    roomHistory.CheckOutDate,
                    roomHistory.BookingStartDate,
                    roomHistory.BookingEndDate,
                    roomHistory.BookingCamera
                );
                return (singleRoomHistory, null);
            }

            if (roomHistory is not null && roomHistories is null)
            {
                var _roomHistories = roomHistories.Select(rt => new RoomHistoryDTO
                (
                    roomHistory.RoomHistoryId,
                    roomHistory.PetId,
                    roomHistory.RoomId,
                    roomHistory.BookingId,
                    roomHistory.CameraId,
                    roomHistory.Status,
                    roomHistory.CheckInDate,
                    roomHistory.CheckOutDate,
                    roomHistory.BookingStartDate,
                    roomHistory.BookingEndDate,
                    roomHistory.BookingCamera
                )).ToList();

                return (null, _roomHistories);
            }

            return (null, null);
        }
    }
}
