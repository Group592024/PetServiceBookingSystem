using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public class CreateRoomHistoryDTO
    {
        public Guid PetId { get; set; }
        public Guid RoomId { get; set; }
        public Guid BookingId { get; set; }
        public DateTime BookingStartDate { get; set; }
        public DateTime BookingEndDate { get; set; }
        public bool BookingCamera { get; set; }
    }
}
