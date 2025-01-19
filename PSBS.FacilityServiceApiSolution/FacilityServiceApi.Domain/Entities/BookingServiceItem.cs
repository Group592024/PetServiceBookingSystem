

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacilityServiceApi.Domain.Entities
{
    public class BookingServiceItem
    {
        [Key, Column("bookingServiceItem_id")]
        public Guid BookingServiceItemId { get; set; }
        [Column("booking_Id")]
        public Guid BookingId { get; set; }
        [Column("serviceVariant_id")]
        public Guid ServiceVariantId { get; set; }
        [Column("pet_id")]
        public Guid PetId { get; set; }
        [Column("price")]
        public decimal Price { get; set; }
        [Column("createAt")]
        public DateTime CreateAt { get; set; }
        [Column("updateAt")]
        public DateTime UpdateAt { get; set; }
        public virtual ServiceVariant ServiceVariant { get; set; } = null!;
    }
}
