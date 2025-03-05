using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class BookingServiceItemRepository(FacilityServiceDbContext context) : IBookingServiceItem
    {

        public async Task<bool> CheckIfVariantHasBooking(Guid serviceVariantId)
        {
            try
            {
                var flag = await context.bookingServiceItems
                                           .AnyAsync(b => b.ServiceVariantId == serviceVariantId);
                return flag;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred when checking");
            }
        }


        public async Task<bool> CheckBookingsForPetAsync(Guid petId)
        {
            return await context.bookingServiceItems
                .AnyAsync(b => b.PetId == petId);
        }

        public async Task<Response> CreateAsync(BookingServiceItem entity)

        {
            try
            {
                var currentEntity = context.bookingServiceItems.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.BookingServiceItemId != Guid.Empty)
                {

                    return new Response(true, "Create service item successfully");
                }
                else
                {
                    return new Response(false, "Cannot create service item due to errors");
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occured adding new service item");
            }
        }

        public Task<Response> DeleteAsync(BookingServiceItem entity)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<BookingServiceItem>> GetAllAsync()
        {
            try
            {
                var currentEntity = await context.bookingServiceItems.ToListAsync();
                return currentEntity ?? new List<BookingServiceItem>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new List<BookingServiceItem>();
            }
        }



        public Task<BookingServiceItem> GetByAsync(Expression<Func<BookingServiceItem, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<BookingServiceItem> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<Response> UpdateAsync(BookingServiceItem entity)
        {
            throw new NotImplementedException();
        }
    }
}
