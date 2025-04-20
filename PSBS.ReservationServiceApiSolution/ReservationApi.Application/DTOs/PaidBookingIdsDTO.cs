namespace ReservationApi.Application.DTOs
{
    public class PaidBookingIdsDTO
    {
        public List<Guid> BookingIds { get; set; } = new();
    }
}
