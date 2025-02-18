using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public record RoomHistoryDTO
    {
        public Guid roomHistoryId { get; set; }
        public Guid petId { get; set; }
        public Guid roomId { get; set; }
        public Guid bookingId { get; set; }
        public Guid? cameraId { get; set; }
        public string status { get; set; }
        public DateTime? checkInDate { get; set; }
        public DateTime? checkOutDate { get; set; }
        public DateTime bookingStartDate { get; set; }
        public DateTime bookingEndDate { get; set; }
        public bool bookingCamera { get; set; }
    }
}
