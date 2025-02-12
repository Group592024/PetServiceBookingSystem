using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Infrastructure.Repositories
{
    public class BookingRepository(ReservationServiceDBContext context) : IBooking
    {
        public async Task<Response> CancelBookingAsync(Guid bookingId)
        {
            var existingBooking = await GetByIdAsync(bookingId);
            try
            {
                
                if(existingBooking == null)
                {
                    return new Response(false, "No detected any booking.");
                }
                var currentBookingStatus = await context.BookingStatuses.Where(bs => bs.BookingStatusId == existingBooking.BookingStatusId).FirstOrDefaultAsync();
                if (currentBookingStatus == null)
                {
                    return new Response(false, "The booking can't be canceled. No currentBookingStatus");
                }
                if (!currentBookingStatus.BookingStatusName.Contains("Pending")  && !currentBookingStatus.BookingStatusName.Contains("Confirmed"))
                {
                    return new Response(false, "The booking can't be canceled.");
                }
                var cancelBookingStatus = await context.BookingStatuses.Where(bs => bs.BookingStatusName.Contains("Cancelled")).FirstOrDefaultAsync();
                if (cancelBookingStatus == null)
                {
                    return new Response(false, "The booking can't be canceled. No cancelBookingStatus");
                }
                existingBooking.BookingStatusId = cancelBookingStatus.BookingStatusId;
                context.Bookings.Update(existingBooking);
                await context.SaveChangesAsync();
                return new Response(true, "Cancel booking successfully!");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occured adding new booking");
            }
        }

        public async Task<Response> CreateAsync(Booking entity)
        {
            try
            {
                var currentEntity = context.Bookings.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.BookingId != Guid.Empty)
                {

                    return new Response(true, "Create Booking successfully")
                    {
                        Data = new BookingResponseDTO { BookingId = currentEntity.BookingId }
                    };
                }
                else
                {
                    return new Response(false, "Cannot create Booking due to errors");
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occured adding new booking");
            }
        }

        public async Task<Response> DeleteAsync(Booking entity)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            try
            {
                var bookings = await context.Bookings.ToListAsync();
                return bookings;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred while retrieving booking.");
            }
        }

        public async Task<IEnumerable<Booking>> GetAllBookingForUserAsync(Guid id)
        {
            try
            {
                var bookings = await context.Bookings.Where(b => b.AccountId == id).ToListAsync();
                return bookings;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred while retrieving booking.");
            }
        }

        public async Task<Booking> GetBookingByBookingCodeAsync(String code)
        {
            try
            {
                var booking = await context.Bookings
                    .AsNoTracking()
                    .SingleOrDefaultAsync(b => b.BookingCode == code);
                return booking!;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred while retrieving booking.");
            }
        }

        public async Task<Booking> GetByAsync(Expression<Func<Booking, bool>> predicate)
        {
            try
            {
                var booking = await context.Bookings.Where(predicate).FirstOrDefaultAsync()!;
                return booking is not null ? booking : null!;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving booking");
            }
        }

        public async Task<Booking> GetByIdAsync(Guid id)
        {
            try
            {
                var booking = await context.Bookings
                    .AsNoTracking()
                    .SingleOrDefaultAsync(b => b.BookingId == id);
                return booking!;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred booking.");
            }
        }

        public Task<Response> UpdateAsync(Booking entity)
        {
            throw new NotImplementedException();
        }


        private string GenerateBookingCode()
        {
            return $"ORD-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
        }
    }
}
