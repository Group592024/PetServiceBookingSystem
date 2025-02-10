using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
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
        public async Task<Response> CreateAsync(Booking entity)
        {
            try
            {
                if (entity is null || entity.BookingId == Guid.Empty)
                    return new Response(false, "Invalid booking data");

                var getBooking = await GetByAsync(p => p.BookingId == entity.BookingId);
                if (getBooking is not null)
                    return new Response(false, $"{entity.BookingId} already added");

                var currentEntity = context.Bookings.Add(entity).Entity;
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.BookingId} added to database successfully") { Data = currentEntity };
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred while adding new booking");
            }
        }

        public async Task<Response> DeleteAsync(Booking entity)
        {
            try
            {
                var booking = await GetByIdAsync(entity.BookingId);
                if (booking is null)
                {
                    return new Response(false, $"{entity.BookingId} not found");
                }

                if (!booking.isPaid)
                {
                    // First deletion attempt: mark as deleted
                    booking.isPaid = true;
                    context.Bookings.Update(booking);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.BookingId} marked as deleted.") { Data = booking };
                }
                else
                {
                    // Check if BookingStatusId is still referenced in Bookings table
                    bool isReferencedInBookings = await context.Bookings
                        .AnyAsync(b => b.BookingId == entity.BookingId);

                    if (isReferencedInBookings)
                    {
                        return new Response(false, $"Cannot permanently delete {entity.BookingId} because it is referenced in existing bookings.");
                    }

                    // Permanently delete from the database
                    context.Bookings.Remove(booking);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.BookingId} permanently deleted.");
                }
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "An error occurred while deleting the booking.");
            }
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            try
            {
                var booking = await context.Bookings.ToListAsync();
                return booking;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
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
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                throw new Exception("Error occurred retrieving booking.");
            }
        }

        public async Task<Booking> GetByIdAsync(Guid id)
        {
            try
            {
                var booking = await context.Bookings
                    .AsNoTracking()
                    .SingleOrDefaultAsync(v => v.BookingId == id);
                return booking!;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred booking.");
            }
        }

        public async Task<Response> UpdateAsync(Booking entity)
        {
           
            try
            {
                var booking = await GetByIdAsync(entity.BookingId);

                if (booking == null)
                {
                    return new Response(false, $"{entity.BookingId} not found");
                }

                booking.AccountId = entity.AccountId == Guid.Empty ? booking.AccountId : entity.AccountId;
                booking.BookingStatusId = entity.BookingStatusId == Guid.Empty ? booking.BookingStatusId : entity.BookingStatusId;
                booking.PaymentTypeId = entity.PaymentTypeId == Guid.Empty ? booking.PaymentTypeId : entity.PaymentTypeId;
                booking.VoucherId = entity.VoucherId == Guid.Empty ? booking.VoucherId : entity.VoucherId;
                booking.BookingTypeId = entity.BookingTypeId == Guid.Empty ? booking.BookingTypeId : entity.BookingTypeId;
                booking.PointRuleId = entity.PointRuleId == Guid.Empty ? booking.PointRuleId : entity.PointRuleId;
                booking.TotalAmount = (entity.TotalAmount != 0) ? entity.TotalAmount : booking.TotalAmount;
                booking.BookingDate = entity.BookingDate == default ? booking.BookingDate : entity.BookingDate;
                booking.Notes = entity.Notes == string.Empty ? booking.Notes : entity.Notes;
                booking.CreateAt = entity.CreateAt == default ? booking.CreateAt : entity.CreateAt;
                booking.UpdateAt = entity.UpdateAt == default ? booking.UpdateAt : entity.UpdateAt;
                booking.isPaid= entity.isPaid;
                booking.BookingId = entity.BookingId;
                context.Entry(booking).State = EntityState.Modified;

                await context.SaveChangesAsync();

                return new Response(true, $"{entity.BookingId} successfully updated") { Data = booking };
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);

                return new Response(false, "Error occurred updating the existing booking status");
            }
        
    }

    }
}
