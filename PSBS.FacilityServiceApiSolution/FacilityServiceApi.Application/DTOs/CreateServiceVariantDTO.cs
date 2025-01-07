namespace FacilityServiceApi.Application.DTOs
{
    public record CreateServiceVariantDTO
    {
        public Guid serviceId { get; set; }
        public decimal servicePrice { get; set; }
        public string serviceContent { get; set; }
    }
}
