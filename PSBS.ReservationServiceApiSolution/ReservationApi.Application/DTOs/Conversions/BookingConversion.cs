using ReservationApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs.Conversions
{
    public class BookingConversion
    {
        public static Booking ToEntity(BookingDTO bokingDTO) => new()
        {
            BookingId = bokingDTO.BookingId,
            AccountId = bokingDTO.AccountId,
            BookingStatusId = bokingDTO.BookingStatusId,
            PaymentTypeId = bokingDTO.PaymentTypeId,
            VoucherId = bokingDTO.VoucherId,
            BookingTypeId = bokingDTO.BookingTypeId,
            PointRuleId = bokingDTO.PointRuleId,
            TotalAmount = bokingDTO.TotalAmount,
            BookingDate = bokingDTO.BookingDate,
            Notes = bokingDTO.Notes,
            CreateAt = bokingDTO.CreateAt,
            UpdateAt = bokingDTO.UpdateAt,
            isPaid = bokingDTO.isPaid,

        };

        public static (BookingDTO?, IEnumerable<BookingDTO>?) FromEntity(Booking booking, IEnumerable<Booking> bookings)
        {
            if (booking is not null || bookings is null)
            {
                var singleBooking = new BookingDTO(
                    booking!.BookingId,
                    booking!.AccountId,
                    booking!.BookingStatusId,
                    booking!.PaymentTypeId,
                    booking!.VoucherId,
                    booking!.BookingTypeId,
                    booking!.PointRuleId,
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
                var list = bookings!.Select(p => new BookingDTO(
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
                    p.isPaid
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
