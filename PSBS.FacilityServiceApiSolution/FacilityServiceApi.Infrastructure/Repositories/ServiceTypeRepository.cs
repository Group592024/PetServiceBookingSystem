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
        public async Task<Response> CreateAsync(ServiceType entity)
        {
            try
            {
                var existingServiceType = await context.ServiceType.FirstOrDefaultAsync(st => st.serviceTypeId == entity.serviceTypeId);
                if (existingServiceType != null)
                {
                    return new Response(false, $"ServiceType with ID {entity.serviceTypeId} already exists!");
                }
                entity.isDeleted = false;
                entity.createAt = DateTime.UtcNow;
                entity.updateAt = DateTime.MinValue;
                var currentEntity = context.ServiceType.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.serviceTypeId != Guid.Empty)
                    return new Response(true, $"{entity.serviceTypeId} added successfully");
                else
                    return new Response(false, "Error occurred while adding the service type");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred adding new ServiceType: {ex.Message}");
            }
        }

        public async Task<Response> DeleteAsync(ServiceType entity)
        {
            try
            {
                var serviceUsingServiceType = await context.Service
                                                           .AnyAsync(s => s.serviceTypeId == entity.serviceTypeId && !s.isDeleted);
                if (serviceUsingServiceType)
                {
                    return new Response(false, $"Cannot delete ServiceType with ID {entity.serviceTypeId} because there are services using it.");
                }

                var serviceType = await context.ServiceType.FirstOrDefaultAsync(st => st.serviceTypeId == entity.serviceTypeId);
                if (serviceType != null)
                {
                    if (serviceType.isDeleted)
                    {
                        context.ServiceType.Remove(serviceType);
                        await context.SaveChangesAsync();
                        return new Response(true, $"ServiceType with ID {entity.serviceTypeId} has been permanently deleted.");
                    }
                    else
                    {
                        serviceType.isDeleted = true;
                        context.ServiceType.Update(serviceType);
                        await context.SaveChangesAsync();
                        return new Response(true, "ServiceType soft deleted successfully.");
                    }
                }

                return new Response(false, "ServiceType not found.");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred while deleting ServiceType: {ex.Message}");
            }
        }

        public async Task<IEnumerable<ServiceType>> GetAllAsync()
        {
            try
            {
                var serviceTypes = await context.ServiceType
                                                .ToListAsync();
                return serviceTypes ?? new List<ServiceType>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving ServiceTypes: {ex.Message}");
            }
        }

        public async Task<ServiceType> GetByAsync(Expression<Func<ServiceType, bool>> predicate)
        {
            try
            {
                var serviceType = await context.ServiceType.Where(predicate).FirstOrDefaultAsync();
                return serviceType ?? throw new InvalidOperationException("ServiceType not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving ServiceType by condition: {ex.Message}");
            }
        }

        public async Task<ServiceType> GetByIdAsync(Guid id)
        {
            try
            {
                var serviceType = await context.ServiceType.FindAsync(id);
                if (serviceType == null)
                {
                    LogExceptions.LogException(new Exception($"ServiceType with ID {id} not found"));
                    return null;
                }
                return serviceType;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving ServiceType by Id: {ex.Message}");
            }
        }

        public async Task<Response> UpdateAsync(ServiceType entity)
        {
            try
            {
                var existingServiceType = await GetByIdAsync(entity.serviceTypeId);
                if (existingServiceType == null)
                {
                    return new Response(false, $"ServiceType with ID {entity.serviceTypeId} not found or already deleted");
                }

                existingServiceType.typeName = entity.typeName;
                existingServiceType.description = entity.description;
                existingServiceType.updateAt = DateTime.UtcNow;
                existingServiceType.isDeleted = entity.isDeleted;

                context.ServiceType.Update(existingServiceType);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.serviceTypeId} updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred updating the ServiceType: {ex.Message}");
            }
        }

        public async Task<IEnumerable<ServiceType>> ListAvailableServiceTypeAsync()
        {
            try
            {
                var serviceTypes = await context.ServiceType
                                                .Where(st => !st.isDeleted)
                                                .ToListAsync();
                return serviceTypes ?? new List<ServiceType>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving non-deleted services");
            }
        }
    }
}