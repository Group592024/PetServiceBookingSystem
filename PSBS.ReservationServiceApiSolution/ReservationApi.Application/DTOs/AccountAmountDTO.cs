namespace ReservationApi.Application.DTOs
{
    public record AccountAmountDTO
    (Guid accountId, decimal totalAmount, int bookings, int completedBookings, int cancelBookings);
}
