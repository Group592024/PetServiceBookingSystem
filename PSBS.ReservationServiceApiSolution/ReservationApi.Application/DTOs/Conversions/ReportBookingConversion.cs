using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.DTOs.Conversions
{
    public static class ReportBookingConversion
    {

        //return list booking status include bookings
        public static (ReportBookingStatusDTO?, IEnumerable<ReportBookingStatusDTO>?)
            FromEntity(BookingStatus status, IEnumerable<BookingStatus> statuses)
        {
            if (statuses is null && status is not null)
            {
                var response = new ReportBookingStatusDTO(status.BookingStatusId,
                    status.BookingStatusName, status.isDeleted,
                    status.Bookings.Select(p => new ReportBookingDTO(
                       p.BookingId,
                       p.AccountId,
                        p.BookingStatusId,
                        p.PaymentTypeId,
                        p.VoucherId,
                        p.BookingTypeId,
                        p.PointRuleId,
                        p.TotalAmount,
                       p.BookingDate,
                        p.Notes,
                        p.CreateAt,
                       p.UpdateAt,
                        p.isPaid)).ToList());
                return (response, null!);
            }

            if (status is null && statuses is not null)
            {
                var responses = statuses.Select(s => new ReportBookingStatusDTO(s.BookingStatusId,
                    s.BookingStatusName, s.isDeleted,
                    s.Bookings.Select(p => new ReportBookingDTO(
                       p.BookingId,
                       p.AccountId,
                        p.BookingStatusId,
                        p.PaymentTypeId,
                        p.VoucherId,
                        p.BookingTypeId,
                        p.PointRuleId,
                        p.TotalAmount,
                       p.BookingDate,
                        p.Notes,
                        p.CreateAt,
                       p.UpdateAt,
                        p.isPaid)).ToList())).ToList();
                return (null!, responses);

            }
            return (null!, null!);
        }
    }
}
