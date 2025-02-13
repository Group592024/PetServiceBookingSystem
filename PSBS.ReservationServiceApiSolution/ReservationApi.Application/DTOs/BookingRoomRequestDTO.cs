using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
{
    public class BookingRoomRequestDTO
    {
        public List<BookingRoomDTO> BookingRooms { get; set; }
        public CustomerDTO Customer { get; set; }
        public string SelectedOption { get; set; }
        public Guid VoucherId { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal DiscountedPrice { get; set; }
    }
}
