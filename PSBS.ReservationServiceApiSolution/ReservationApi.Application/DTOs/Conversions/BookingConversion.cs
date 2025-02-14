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
        public static Booking ToEntityForCreate(AddBookingDTO addBookingDTO) => new()
        {
            BookingId = Guid.Empty,
            BookingCode = $"ORD-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}",
            AccountId = addBookingDTO.AccountId,
            PaymentTypeId = addBookingDTO.PaymentTypeId,
            VoucherId = addBookingDTO.VoucherId,
            BookingTypeId = addBookingDTO.BookingTypeId,
            PointRuleId = null,
            TotalAmount = addBookingDTO.TotalAmount,
            Notes = addBookingDTO.Notes,
            BookingDate = DateTime.Now,
            CreateAt = DateTime.Now,
            UpdateAt = DateTime.Now,
            isPaid = false,
            BookingStatusId = addBookingDTO.BookingStatusId,
        };
        public static (BookingDTO?, IEnumerable<BookingDTO>?) FromEntity(Booking booking, IEnumerable<Booking> bookings)
        {
            if (booking is not null || bookings is null)
            {
                var singleBooking = new BookingDTO(
                    booking.BookingId,
                    booking.BookingCode,
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
                    b.BookingCode,
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