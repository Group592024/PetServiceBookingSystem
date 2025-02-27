namespace ReservationApi.Application.DTOs
{
    public record ReportBookingTypeDTO
    (string BookingTypeName,
        List<AmountDTO> AmountDTOs);
}
