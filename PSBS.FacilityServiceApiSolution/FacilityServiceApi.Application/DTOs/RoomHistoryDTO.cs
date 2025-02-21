using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs
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
     DateTime bookingEndDate ,
     bool bookingCamera 
    );
}
