namespace FacilityServiceApi.Application.DTOs
{
    public record UpdateServiceDTO
    {
        public Guid serviceTypeId { get; set; }
        public string serviceName { get; set; }
        public string serviceDescription { get; set; }
        public bool isDeleted { get; set; }
    }
}
