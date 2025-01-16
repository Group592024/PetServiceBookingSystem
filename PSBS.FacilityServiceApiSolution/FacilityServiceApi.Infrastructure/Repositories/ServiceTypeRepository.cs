using FacilityServiceApi.Application.DTOs;
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
                var existingServiceType = await context.ServiceType
                    .FirstOrDefaultAsync(st => st.typeName.ToLower() == entity.typeName.ToLower());

                if (existingServiceType != null)
                {
                    return new Response(false, $"ServiceType with Name {entity.typeName} already exists!");
                }

                entity.isDeleted = false;
                entity.createAt = DateTime.Now;
                entity.updateAt = DateTime.Now;

                var currentEntity = context.ServiceType.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.serviceTypeId != Guid.Empty)
                    return new Response(true, $"{entity.typeName} added successfully") { Data = currentEntity };
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
                var relatedServices = await context.Service
                                                   .Where(s => s.serviceTypeId == entity.serviceTypeId)
                                                   .ToListAsync();

                var serviceType = await context.ServiceType
                                                .FirstOrDefaultAsync(st => st.serviceTypeId == entity.serviceTypeId);

                if (serviceType == null)
                {
                    return new Response(false, "ServiceType not found.");
                }

                if (serviceType.isDeleted)
                {
                    if (relatedServices.Any())
                    {
                        return new Response(false, $"Cannot delete ServiceType with Name {entity.typeName} because it is still in use by related services.");
                    }

                    context.ServiceType.Remove(serviceType);
                    await context.SaveChangesAsync();
                    return new Response(true, $"ServiceType with Name {entity.typeName} has been permanently deleted.");
                }
                else
                {
                    serviceType.isDeleted = true;
                    context.ServiceType.Update(serviceType);

                    serviceType.updateAt = DateTime.Now; 

                    foreach (var service in relatedServices)
                    {
                        service.isDeleted = true;
                        context.Service.Update(service);
                        service.updateAt = DateTime.Now;  
                    }

                    await context.SaveChangesAsync();
                    return new Response(true, "ServiceType and related services soft deleted successfully.") { Data = serviceType };
                }
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

                var duplicateServiceType = await context.ServiceType
                    .FirstOrDefaultAsync(st => st.serviceTypeId != entity.serviceTypeId && st.typeName.ToLower() == entity.typeName.ToLower());

                if (duplicateServiceType != null)
                {
                    return new Response(false, $"ServiceType with Name {entity.typeName} already exists!");
                }

                existingServiceType.typeName = entity.typeName;
                existingServiceType.description = entity.description;
                existingServiceType.updateAt = DateTime.Now;
                existingServiceType.isDeleted = entity.isDeleted;

                context.ServiceType.Update(existingServiceType);
                await context.SaveChangesAsync();

                var serviceTypeDto = new ServiceTypeDTO
                {
                    serviceTypeId = existingServiceType.serviceTypeId,
                    typeName = existingServiceType.typeName,
                    description = existingServiceType.description,
                    createAt = existingServiceType.createAt,
                    updateAt = existingServiceType.updateAt,
                    isDeleted = existingServiceType.isDeleted
                };

                return new Response(true, $"{entity.typeName} updated successfully") { Data = serviceTypeDto };
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