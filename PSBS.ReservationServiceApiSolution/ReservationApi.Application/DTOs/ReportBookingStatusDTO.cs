namespace ReservationApi.Application.DTOs
{
    public record ReportBookingStatusDTO
    (Guid BookingStatusId,
       string BookingStatusName,
        bool isDeleted,
        List<ReportBookingDTO> ReportBookings);
}
