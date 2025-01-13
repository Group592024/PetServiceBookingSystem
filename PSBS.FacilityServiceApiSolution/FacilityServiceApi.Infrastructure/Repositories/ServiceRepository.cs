using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class ServiceRepository(FacilityServiceDbContext context) : IService
    {
        public async Task<Response> CreateAsync(Service entity)
        {
            try
            {
                var existingService = await context.Service.FirstOrDefaultAsync(r => r.serviceId == entity.serviceId);
                if (existingService != null)
                {
                    return new Response(false, $"Service with ID {entity.serviceId} already exists!");
                }
                entity.isDeleted = false;
                var currentEntity = context.Service.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.serviceId != Guid.Empty)
                    return new Response(true, $"{entity.serviceId} added successfully") { Data = currentEntity };
                else
                    return new Response(false, "Error occurred while adding the service");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred adding new service");
            }
        }

        public async Task<Response> DeleteAsync(Service entity)
        {
            try
            {
                var Service = await GetByIdAsync(entity.serviceId);

                Service.isDeleted = true;
                context.Service.Update(Service);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.serviceId} is marked as soft deleted successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing soft delete on service");
            }
        }

        public async Task<Response> DeleteSecondAsync(Service entity)
        {
            try
            {
                var service = await GetByIdAsync(entity.serviceId);

                context.Service.Remove(service);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.serviceId} is deleted permanently successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing delete permanently on service");
            }
        }


        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            try
            {
                var Services = await context.Service
                                          .ToListAsync();
                return Services ?? new List<Service>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving services");
            }
        }

        public async Task<Service> GetByAsync(Expression<Func<Service, bool>> predicate)
        {
            try
            {
                var Service = await context.Service.Where(predicate).FirstOrDefaultAsync();

                return Service ?? throw new InvalidOperationException("Service not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);

                throw new InvalidOperationException("Error occurred retrieving service", ex);
            }
        }

        public async Task<Service> GetByIdAsync(Guid id)
        {
            try
            {
                var Service = await context.Service.FindAsync(id);
                return Service != null ? Service : null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving service");
            }
        }

        public async Task<Response> UpdateAsync(Service entity)
        {
            try
            {
                var Service = await GetByIdAsync(entity.serviceId);

                Service.isDeleted = false;
                Service.serviceTypeId = entity.serviceTypeId;
                Service.serviceName = entity.serviceName;
                Service.serviceImage = entity.serviceImage;
                Service.serviceDescription = entity.serviceDescription;
                Service.updateAt = DateTime.Now;
                context.Service.Update(Service);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.serviceId} is updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating the service");
            }
        }
    }
}
