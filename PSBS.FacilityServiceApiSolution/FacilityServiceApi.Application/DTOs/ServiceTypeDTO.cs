using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTOs
{
    public record ServiceTypeDTO
    {
        public Guid serviceTypeId { get; set; }
        [Required]
        public string typeName { get; set; }
        public string description { get; set; }
        public DateTime createAt { get; set; }
        public DateTime updateAt { get; set; }
    }
}
