namespace FacilityServiceApi.Application.DTOs
{
    public record CreateServiceDTO
    {

        public Guid serviceTypeId { get; set; }
        public string serviceName { get; set; }
        public string serviceDescription { get; set; }
    }
}
