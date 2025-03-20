using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTOs
{
    public record CreateServiceDTO
    {
        [Required]
        public Guid serviceTypeId { get; set; }
        [Required]
        public string serviceName { get; set; }
        public string serviceDescription { get; set; }
    }
}
