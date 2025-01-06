using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class ServiceTypeRepository(FacilityServiceDbContext context) : IServiceType
    {
        public Task<Response> CreateAsync(ServiceType entity)
        {
            throw new NotImplementedException();
        }

        public Task<Response> DeleteAsync(ServiceType entity)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<ServiceType>> GetAllAsync()
        {
            try
            {
                return await context.ServiceType.Where(r => r.isDeleted == false).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error occurred retrieving service types: {ex.Message}");
            }
        }

        public Task<ServiceType> GetByAsync(Expression<Func<ServiceType, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public async Task<ServiceType> GetByIdAsync(Guid id)
        {
            try
            {
                var serviceType = await context.ServiceType.FindAsync(id);
                return serviceType != null ? serviceType : null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving service type");
            }
        }

        public Task<Response> UpdateAsync(ServiceType entity)
        {
            throw new NotImplementedException();
        }
    }
}
