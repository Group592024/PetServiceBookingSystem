
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace FacilityServiceApi.Domain.Entities
{
    public class RoomHistory
    {
        [Key, Column("roomHistory_id")]
        public Guid RoomHistoryId { get; set; }
        [Column("pet_id")]
        public Guid PetId { get; set; }
        [Column("room_id")]
        public Guid RoomId { get; set; }
        [Column("booking_Id")]
        public Guid BookingId { get; set; }
        [Column("camera_id")]
        public Guid CameraId { get; set; }
        [Column("status")]
        public string Status { get; set; } = null!;
        [Column("checkin_date")]
        public DateTime CheckInDate { get; set; }
        [Column("checkout_date")]
        public DateTime CheckOutDate { get; set; }
        public virtual Camera Camera { get; set; } = null!;
        public virtual Room Room { get; set; } = null!;

    }
}
