using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacilityServiceApi.Domain.Entities
{
    public class Room
    {
        [Key]
        public Guid roomId { get; set; }
        [ForeignKey("RoomType")]
        public Guid roomTypeId { get; set; }
        public string description { get; set; }
        public bool status { get; set; }
        public bool isDeleted { get; set; }
        public string roomImage { get; set; }
        public bool hasCamera { get; set; }
        public RoomType RoomType { get; set; }
    }
}
