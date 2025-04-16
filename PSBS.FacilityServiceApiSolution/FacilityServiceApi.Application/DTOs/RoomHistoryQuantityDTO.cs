namespace FacilityServiceApi.Application.DTOs
{
    public record RoomHistoryQuantityDTO
    (string roomTypeName, int quantity, decimal? income = null);
}
