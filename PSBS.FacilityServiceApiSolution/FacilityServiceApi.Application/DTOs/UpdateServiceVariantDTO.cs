namespace FacilityServiceApi.Application.DTOs
{
    public record UpdateServiceVariantDTO
    {
        public decimal servicePrice { get; set; }
        public string serviceContent { get; set; }

        public bool isDeleted { get; set; }
    }
}
