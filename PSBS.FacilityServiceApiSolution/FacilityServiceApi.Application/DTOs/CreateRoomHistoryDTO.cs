using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs
{
    public record CreateRoomHistoryDTO
    ( Guid PetId,
     Guid RoomId ,
     Guid BookingId,
     DateTime BookingStartDate,
     DateTime BookingEndDate,
     bool BookingCamera
    );
}
