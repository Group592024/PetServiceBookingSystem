using Microsoft.AspNetCore.Http.HttpResults;
using ReservationApi.Application.Intefaces;
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
        public static Booking ToEntity(BookingDTO bookingDTO) => new()
        {
            BookingId = bookingDTO.BookingId,
            AccountId = bookingDTO.AccountId,
            BookingStatusId = bookingDTO.BookingStatusId,
            PaymentTypeId = bookingDTO.PaymentTypeId,
            VoucherId = bookingDTO.VoucherId,
            BookingTypeId = bookingDTO.BookingTypeId,
            PointRuleId = bookingDTO.PointRuleId,
            TotalAmount = bookingDTO.TotalAmount,
            BookingDate = bookingDTO.BookingDate,
            Notes = bookingDTO.Notes,
            CreateAt = bookingDTO.CreateAt,
            UpdateAt = bookingDTO.UpdateAt,
            isPaid = bookingDTO.isPaid

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
