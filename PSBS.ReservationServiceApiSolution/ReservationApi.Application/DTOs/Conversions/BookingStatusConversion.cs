 using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.DTOs.Conversions
{
    public class BookingStatusConversion
    {
        public static BookingStatus ToEntity(BookingStatusDTO bokingStatusDTO) => new()
        {
            BookingStatusId = bokingStatusDTO.BookingStatusId,
            BookingStatusName = bokingStatusDTO.BookingStatusName,
            isDeleted = bokingStatusDTO.isDeleted,

        };

        public static (BookingStatusDTO?, IEnumerable<BookingStatusDTO>?) FromEntity(BookingStatus bookingStatus, IEnumerable<BookingStatus> bookingStatuses)
        {
            if (bookingStatus is not null || bookingStatuses is null)
            {
                var singleBookingStatus = new BookingStatusDTO(
                    bookingStatus!.BookingStatusId,
                    bookingStatus.BookingStatusName,
                    bookingStatus.isDeleted
                    );
                return (singleBookingStatus, null);
            }
            if (bookingStatus is null || bookingStatuses is not null)
            {
                var list = bookingStatuses!.Select(p => new BookingStatusDTO(
                    p.BookingStatusId,
                    p.BookingStatusName,
                    p.isDeleted
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
