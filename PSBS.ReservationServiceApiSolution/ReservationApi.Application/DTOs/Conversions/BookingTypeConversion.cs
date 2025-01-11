
using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.DTOs.Conversions
{
    public class BookingTypeConversion
    {
        public static BookingType ToEntity(BookingTypeDTO bookingTypeDTO) => new()
        {
            BookingTypeId = bookingTypeDTO.BookingTypeId,
            BookingTypeName = bookingTypeDTO.BookingTypeName,
            isDeleted = bookingTypeDTO.isDeleted,

        };

        public static (BookingTypeDTO?, IEnumerable<BookingTypeDTO>?) FromEntity(BookingType bookingType, IEnumerable<BookingType> bookingTypes)
        {
            if (bookingType is not null || bookingTypes is null)
            {
                var singleBookingType = new BookingTypeDTO(
                    bookingType!.BookingTypeId,
                    bookingType.BookingTypeName,
                    bookingType.isDeleted
                    );
                return (singleBookingType, null);
            }
            if (bookingType is null || bookingTypes is not null)
            {
                var list = bookingTypes!.Select(p => new BookingTypeDTO(
                    p.BookingTypeId,
                    p.BookingTypeName,
                    p.isDeleted
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
