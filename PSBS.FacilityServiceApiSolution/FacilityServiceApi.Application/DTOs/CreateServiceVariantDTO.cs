using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTOs
{
    public record CreateServiceVariantDTO
    {
        [Required]
        public Guid serviceId { get; set; }
        [Required]
        public decimal servicePrice { get; set; }
        [Required]
        public string serviceContent { get; set; }
    }
}
