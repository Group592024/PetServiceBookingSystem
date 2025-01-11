

using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using System.Linq.Expressions;

namespace ReservationApi.Infrastructure.Repositories
{
    public class BookingStatusRepository(ReservationServiceDBContext context) : IBookingStatus
    {
        public async Task<Response> CreateAsync(BookingStatus entity)
        {
            try
            {
                var getBookingStatus = await GetByAsync(p => p.BookingStatusName!.Equals(entity.BookingStatusName));
                if (getBookingStatus is not null && !string.IsNullOrEmpty(getBookingStatus.BookingStatusName))
                    return new Response(false, $"{entity.BookingStatusName} already added");

                var currentEntity = context.BookingStatuses.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.BookingStatusId.ToString().Length > 0)
                {
                    return new Response(true, $"{entity.BookingStatusName} added to database successfully") { Data = currentEntity };
                }
                else
                {
                    return new Response(false, $"{entity.BookingStatusName} cannot be added due to errors");
                }
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured adding new voucher");
            }
        }

        public async Task<Response> DeleteAsync(BookingStatus entity)
        {
            try
            {
                var bookingStatus = await GetByIdAsync(entity.BookingStatusId);
                if (bookingStatus is null)
                {
                    return new Response(false, $"{entity.BookingStatusName} not found");
                }

                if (!bookingStatus.isDeleted)
                {
                    // First deletion attempt: mark as deleted
                    bookingStatus.isDeleted = true;
                    context.BookingStatuses.Update(bookingStatus);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.BookingStatusName} marked as deleted.") { Data = bookingStatus };
                }
                else
                {
                    // Check if BookingStatusId is still referenced in Bookings table
                    bool isReferencedInBookings = await context.Bookings
                        .AnyAsync(b => b.BookingStatusId == entity.BookingStatusId);

                    if (isReferencedInBookings)
                    {
                        return new Response(false, $"Cannot permanently delete {entity.BookingStatusName} because it is referenced in existing bookings.");
                    }

                    // Permanently delete from the database
                    context.BookingStatuses.Remove(bookingStatus);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.BookingStatusName} permanently deleted.") ;
                }
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "An error occurred while deleting the booking status.");
            }
        }


        public async Task<IEnumerable<BookingStatus>> GetAllAsync()
        {
            try
            {
                var bookingStatuses = await context.BookingStatuses.ToListAsync();
                return bookingStatuses;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while retrieving booking Status.");
            }
        }

        public async Task<BookingStatus> GetByAsync(Expression<Func<BookingStatus, bool>> predicate)
        {
            try
            {
                var bookingStatus = await context.BookingStatuses.Where(predicate).FirstOrDefaultAsync()!;
                return bookingStatus is not null ? bookingStatus : null!;
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                throw new Exception("Error occurred retrieving booking status");
            }
        }

        public async Task<BookingStatus> GetByIdAsync(Guid id)
        {
            try
            {
                var bookingStatus = await context.BookingStatuses
                    .AsNoTracking()
                    .SingleOrDefaultAsync(v => v.BookingStatusId == id); 
                return bookingStatus!;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred booking status.");
            }
        }

        public async Task<Response> UpdateAsync(BookingStatus entity)
        {
            try
            {
                var bookingStatus = await GetByIdAsync(entity.BookingStatusId);
                if (bookingStatus is null)
                {
                    return new Response(false, $"{entity.BookingStatusName} not found");
                }
              if(bookingStatus.BookingStatusName != entity.BookingStatusName)
                {
                    var getBookingStatus = await GetByAsync(p => p.BookingStatusName!.Equals(entity.BookingStatusName));
                    if (getBookingStatus is not null && !string.IsNullOrEmpty(getBookingStatus.BookingStatusName))
                        return new Response(false, $"{entity.BookingStatusName} already added");
                }
                context.Entry(bookingStatus).State = EntityState.Detached;
                context.BookingStatuses.Update(entity);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.BookingStatusName} successfully updated") { Data = entity };
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occurred updating the existing booking status");
            }
        }
    }
}
