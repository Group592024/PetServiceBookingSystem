using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public record RoomHistoryDTO
    (
     Guid roomHistoryId,
     Guid petId,
     Guid roomId,
     Guid bookingId,
     Guid? cameraId,
     string status,
     DateTime? checkInDate,
     DateTime? checkOutDate,
     DateTime bookingStartDate,
     DateTime bookingEndDate,
     bool bookingCamera
    );
}
