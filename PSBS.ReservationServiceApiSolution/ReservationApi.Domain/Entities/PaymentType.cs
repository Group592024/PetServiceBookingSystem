
using System.ComponentModel.DataAnnotations.Schema;

namespace ReservationApi.Domain.Entities
{
    public class PaymentType
    {
        [Column("paymentType_Id")]
        public Guid PaymentTypeId { get; set; }
        [Column("paymentType_name")]
        public string PaymentTypeName { get; set; } = null!;
        public bool isDeleted { get; set; }
        public virtual ICollection<Booking>? Bookings { get; set; }
    }
}
