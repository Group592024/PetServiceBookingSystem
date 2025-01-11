namespace FacilityServiceApi.Application.DTOs
{
    public record ServiceVariantDTO
    {
        public Guid serviceVariantId { get; set; }
        public Guid serviceId { get; set; }
        public decimal servicePrice { get; set; }
        public string serviceContent { get; set; }
        public DateTime createAt { get; set; }
        public DateTime updateAt { get; set; }
    }
}
