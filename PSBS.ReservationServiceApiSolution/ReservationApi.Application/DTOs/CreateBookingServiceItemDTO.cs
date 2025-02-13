using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public class CreateBookingServiceItemDTO
    {
        public Guid BookingId { get; set; }
        public Guid ServiceVariantId { get; set; }
        public Guid PetId { get; set; }
        public decimal Price { get; set; }
    }
}
