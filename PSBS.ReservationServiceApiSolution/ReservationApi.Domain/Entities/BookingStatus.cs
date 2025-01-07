

using System.ComponentModel.DataAnnotations.Schema;

namespace ReservationApi.Domain.Entities
{
    public  class BookingStatus
    {
        [Column("bookingStatus_Id")]
        public Guid BookingStatusId { get; set; }
        [Column("bookingStatus_name")]
        public string BookingStatusName { get; set; } = null!;

        public bool isDeleted { get; set; }
        public virtual ICollection<Booking>? Bookings { get; set; }
    }
}
