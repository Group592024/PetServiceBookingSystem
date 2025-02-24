namespace ReservationApi.Application.DTOs
{
    public record ReportBookingDTO(
    Guid BookingId,
   Guid AccountId,
   Guid BookingStatusId,
    Guid PaymentTypeId,
    Guid? VoucherId,
    Guid BookingTypeId,
    Guid? PointRuleId,
    decimal TotalAmount,
   DateTime BookingDate,
    string Notes,
    DateTime? CreateAt,
   DateTime? UpdateAt,
    bool isPaid);
}
