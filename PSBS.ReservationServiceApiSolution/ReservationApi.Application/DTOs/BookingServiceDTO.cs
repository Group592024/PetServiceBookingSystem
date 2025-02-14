using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public class BookingServiceDTO
    {
        public Guid Service { get; set; }
        public Guid Pet { get; set; }
        public decimal Price { get; set; }
        public Guid ServiceVariant { get; set; }

    }
}
