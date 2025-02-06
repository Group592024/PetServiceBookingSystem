using FacilityServiceApi.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTOs
{
    public record ServiceDTO
    {
        public Guid serviceId { get; set; }
        public Guid serviceTypeId { get; set; }
        [Required]
        public string serviceName { get; set; }
        public string serviceImage { get; set; }
        public string serviceDescription { get; set; }

        public DateTime createAt { get; set; }
        public DateTime updateAt { get; set; }

        public bool isDeleted { get; set; }

        public ServiceType? ServiceType { get; set; }
    }
}
