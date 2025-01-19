using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacilityServiceApi.Domain.Entities
{
    public class Room
    {
        [Key, Column("room_id")]
        public Guid roomId { get; set; }
        [ForeignKey("RoomType")]
        [Column("roomType_id")]
        public Guid roomTypeId { get; set; }
        [Column("roomName")]
        public string roomName { get; set; }
        [Column("description")]
        public string description { get; set; }
        [Column("status")]
        public string status { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }
        [Column("room_image")]
        public string roomImage { get; set; }
        [Column("has_camera")]
        public bool hasCamera { get; set; }
        public virtual RoomType? RoomType { get; set; }
        public virtual ICollection<RoomHistory>? RoomHistories { get; set; }
    }
}
