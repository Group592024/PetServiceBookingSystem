
using FacilityServiceApi.Domain.Entities;

namespace FacilityServiceApi.Application.DTOs
{
    public record ServiceTypeDTO
    {
        public Guid serviceTypeId { get; set; }
        public string typeName { get; set; }
        public string description { get; set; }
        public DateTime? createAt { get; set; }
        public DateTime updateAt { get; set; }
        public bool? isDeleted { get; set; }

        public virtual ICollection<Service> Services { get; set; }

    }
}