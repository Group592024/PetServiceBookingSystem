using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public class BookingServiceRequestDTO
    {
        public List<BookingServiceDTO> Services { get; set; } 
        public CustomerDTO Customer { get; set; }
        public string SelectedOption { get; set; }
        public Guid VoucherId { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal DiscountedPrice { get; set; }
        public DateTime BookingServicesDate { get; set; }

    }
}
