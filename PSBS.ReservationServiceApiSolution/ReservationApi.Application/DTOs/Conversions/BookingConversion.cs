using ReservationApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Azure.Core.HttpHeader;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ReservationApi.Application.DTOs.Conversions
{
    public class BookingConversion
    {
        public static Booking ToEntity(AddBookingDTO addBookingDTO) => new()
        {
            AccountId = addBookingDTO.AccountId,
            PaymentTypeId = addBookingDTO.PaymentTypeId,
            VoucherId = addBookingDTO.VoucherId,
            BookingTypeId = addBookingDTO.BookingTypeId,
            PointRuleId = addBookingDTO.PointRuleId,
            TotalAmount = addBookingDTO.TotalAmount,
            Notes = addBookingDTO.Notes
        };
        public static (BookingDTO?, IEnumerable<BookingDTO>?) FromEntity(Booking booking, IEnumerable<Booking> bookings)
        {
            if (booking is not null || bookings is null)
            {
                var singleBooking = new BookingDTO(
                    booking.BookingId,
                    booking.AccountId,
                    booking.BookingStatusId,
                    booking.PaymentTypeId,
                    booking.VoucherId,
                    booking.BookingTypeId,
                    booking.PointRuleId,
                    booking.TotalAmount,
                    booking.BookingDate,
                    booking.Notes,
                    booking.CreateAt,
                    booking.UpdateAt,
                    booking.isPaid
                    );
                return (singleBooking, null);
            }
            if (booking is null || bookings is not null)
            {
                var list = bookings!.Select(b => new BookingDTO(
                    b.BookingId,
                    b.AccountId,
                    b.BookingStatusId,
                    b.PaymentTypeId,
                    b.VoucherId,
                    b.BookingTypeId,
                    b.PointRuleId,
                    b.TotalAmount,
                    b.BookingDate,
                    b.Notes,
                    b.CreateAt,
                    b.UpdateAt,
                    b.isPaid
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
