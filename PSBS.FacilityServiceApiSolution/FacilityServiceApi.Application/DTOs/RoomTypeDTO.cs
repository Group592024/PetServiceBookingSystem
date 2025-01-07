

using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTO
{
    public record RoomTypeDTO
    {
        public Guid roomTypeId { get; set; }
        [Required]
        public string name { get; set; }
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price per hour must be greater than 0.")]
        public decimal pricePerHour { get; set; }
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price per day must be greater than 0.")]
        public decimal pricePerDay { get; set; }
        public string description { get; set; }
        public bool? isDeleted { get; set; }
    }
}
