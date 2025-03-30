using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTOs
{
    public record UpdateServiceDTO
    {
        [Required]
        public Guid serviceTypeId { get; set; }
        [Required]
        public string serviceName { get; set; }
        public string serviceDescription { get; set; }
        [Required]
        public bool isDeleted { get; set; }
    }
}
