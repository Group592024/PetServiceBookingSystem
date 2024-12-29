using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacilityServiceApi.Domain.Entities
{
    public class RoomType
    {
        [Key,Column("roomType_id")]
        public Guid roomTypeId { get; set; }
        [Column("name")]
        public string name { get; set; }
        [Column("pricePerHour")]
        public decimal pricePerHour { get; set; }
        [Column("pricePerDay")]
        public decimal pricePerDay { get; set; }
        [Column("description")]
        public string description { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }
        public ICollection<Room> Rooms { get; set; }
    }
}
