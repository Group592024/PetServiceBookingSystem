using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public class BookingRoomDTO
    {
        public Guid Room { get; set; }
        public Guid Pet { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public decimal Price { get; set; }
        public bool Camera { get; set; }
    }
}
