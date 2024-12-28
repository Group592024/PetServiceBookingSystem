using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Domain.Entities
{
    public class RoomType
    {
        [Key]
        public Guid roomTypeId { get; set; }
        public string name { get; set; }
        public decimal pricePerHour { get; set; }
        public decimal pricePerDay { get; set; }
        public string description { get; set; }
        public bool isDeleted { get; set; }
        public ICollection<Room> Rooms { get; set; }
    }
}
