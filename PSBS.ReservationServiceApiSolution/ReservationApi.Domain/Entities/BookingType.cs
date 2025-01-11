
using System.ComponentModel.DataAnnotations.Schema;

namespace ReservationApi.Domain.Entities
{
    public class BookingType
    {
        [Column("bookingType_Id")]
        public Guid BookingTypeId { get; set; }
        [Column("bookingTpye_name")]
        public string BookingTypeName { get; set; } = null!;
        public bool isDeleted { get; set; }
        public virtual ICollection<Booking>? Bookings { get; set; }
    }
}
