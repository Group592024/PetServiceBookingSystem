using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FacilityServiceApi.Domain.Entities
{
    public class RoomType
    {
        [Key, Column("roomType_id")]
        public Guid roomTypeId { get; set; }
        [Column("name")]
        public string name { get; set; }
        [Column("price")]
        public decimal price { get; set; }
        [Column("description")]
        public string description { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }
        [JsonIgnore]
        public ICollection<Room> Rooms { get; set; }
    }
}
