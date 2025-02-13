

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReservationApi.Domain.Entities
{
    public class Booking
    {
        [Column("booking_Id")]
        [Key]
        public Guid BookingId { get; set; }
        [Column("booking_Code")]
        public String? BookingCode { get; set; }

        [Column("account_Id")]
        public Guid AccountId { get; set; }
        [Column("bookingStatus_Id")]
        public Guid BookingStatusId { get; set; }
        [Column("paymentType_Id")]
        public Guid PaymentTypeId { get; set; }
        [Column("voucher_Id")]
        public Guid? VoucherId { get; set; }
        [Column("bookingType_Id")]
        public Guid BookingTypeId { get; set; }
        [Column("pointRule_Id")]
        public Guid? PointRuleId { get; set; }
        [Column("totalAmount")]
        public  decimal TotalAmount { get; set; }
        [Column("bookingDate")]
        public DateTime BookingDate { get; set; }
        [Column("notes")]
        public string? Notes { get; set; } = null!;
        [Column("createAt")]
        public DateTime? CreateAt { get; set; }
        [Column("updatedAt")]
        public DateTime? UpdateAt { get; set; }
        [Column("isPaid")]
        public bool isPaid { get; set; }

        public virtual BookingStatus BookingStatus { get; set; } = null!;
        public virtual BookingType BookingType { get; set; } = null!;
        public virtual PaymentType PaymentType { get; set; } = null!;
        public virtual PointRule PointRule { get; set; } = null!;

    }
}
