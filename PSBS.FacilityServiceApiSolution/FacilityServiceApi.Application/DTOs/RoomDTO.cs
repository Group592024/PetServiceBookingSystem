
using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTO
{
    public record RoomDTO
    {
        public Guid? roomId { get; set; }
        [Required]
        public Guid roomTypeId { get; set; }
        public string description { get; set; }
        public bool status { get; set; }
        public bool? isDeleted { get; set; }
        public string? roomImage { get; set; }
        public bool hasCamera { get; set; }
    }
}
