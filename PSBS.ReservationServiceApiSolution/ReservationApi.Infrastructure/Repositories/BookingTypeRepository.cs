
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using System.Linq.Expressions;

namespace ReservationApi.Infrastructure.Repositories
{
    public class BookingTypeRepository(ReservationServiceDBContext context) : IBookingType
    {
        public async Task<Response> CreateAsync(BookingType entity)
        {
            try
            {
                var getBookingType = await GetByAsync(p => p.BookingTypeName!.Equals(entity.BookingTypeName));
                if (getBookingType is not null && !string.IsNullOrEmpty(getBookingType.BookingTypeName))
                    return new Response(false, $"{entity.BookingTypeName} already added");

                var currentEntity = context.BookingTypes.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.BookingTypeId.ToString().Length > 0)
                {
                    return new Response(true, $"{entity.BookingTypeName} added to database successfully") { Data = currentEntity };
                }
                else
                {
                    return new Response(false, $"{entity.BookingTypeName} cannot be added due to errors");
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

        public async Task<Response> DeleteAsync(BookingType entity)
        {
            try
            {
                var bookingType = await context.BookingTypes.FindAsync(entity.BookingTypeId);
                if (bookingType is null)
                {
                    return new Response(false, $"{entity.BookingTypeName} not found");
                }

                if (!bookingType.isDeleted)
                {
                    // First deletion attempt: mark as deleted
                    bookingType.isDeleted = true;
                    context.BookingTypes.Update(bookingType);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.BookingTypeName} marked as deleted.") { Data = bookingType };
                }
                else
                {
                    // Check if BookingStatusId is still referenced in Bookings table
                    bool isReferencedInBookings = await context.Bookings
                        .AnyAsync(b => b.BookingTypeId == entity.BookingTypeId);

                    if (isReferencedInBookings)
                    {
                        return new Response(false, $"Cannot permanently delete {entity.BookingTypeName} because it is referenced in existing bookings.");
                    }

                    // Permanently delete from the database
                    context.BookingTypes.Remove(bookingType);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.BookingTypeName} permanently deleted.");
                }
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "An error occurred while deleting the booking type");
            }
        }

        public async Task<IEnumerable<BookingType>> GetAllAsync()
        {
            try
            {
                var bookingTypes = await context.BookingTypes.ToListAsync();
                return bookingTypes;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while retrieving booking type");
            }
        }

        public async Task<BookingType> GetByAsync(Expression<Func<BookingType, bool>> predicate)
        {
            try
            {
                var bookingType = await context.BookingTypes.Where(predicate).FirstOrDefaultAsync()!;
                return bookingType is not null ? bookingType : null!;
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                throw new Exception("Error occurred retrieving booking status");
            }
        }

        public async Task<BookingType> GetByIdAsync(Guid id)
        {
            try
            {
                var bookingType = await context.BookingTypes
                    .AsNoTracking()
                    .SingleOrDefaultAsync(v => v.BookingTypeId == id);
                return bookingType!;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred booking type");
            }
        }

            public  async Task<Response> UpdateAsync(BookingType entity)
        {
            try
            {
                var bookingType = await context.BookingTypes.FindAsync(entity.BookingTypeId);
                if (bookingType is null)
                {
                    return new Response(false, $"{entity.BookingTypeName} not found");
                }
                if (bookingType.BookingTypeName != entity.BookingTypeName)
                {
                    var getBookingType = await GetByAsync(p => p.BookingTypeName!.Equals(entity.BookingTypeName));
                    if (getBookingType is not null && !string.IsNullOrEmpty(getBookingType.BookingTypeName))
                        return new Response(false, $"{entity.BookingTypeName} already added");
                }            

                context.Entry(bookingType).State = EntityState.Detached;
                    context.BookingTypes.Update(entity);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.BookingTypeName} successfully updated") { Data = entity };
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
