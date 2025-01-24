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

        public Task<Response> CreateAsync(BookingServiceItem entity)
        {
            throw new NotImplementedException();
        }

        public Task<Response> DeleteAsync(BookingServiceItem entity)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<BookingServiceItem>> GetAllAsync()
        {
            throw new NotImplementedException();
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
