using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;


namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class ServiceVariantRepository(FacilityServiceDbContext context) : IServiceVariant
    {
        public async Task<Response> CreateAsync(ServiceVariant entity)
        {
            try
            {
                var existingServiceVariant = await context.ServiceVariant.FirstOrDefaultAsync(r => r.serviceVariantId == entity.serviceVariantId);
                if (existingServiceVariant != null)
                {
                    return new Response(false, $"Service Variant with ID {entity.serviceVariantId} already exists!");
                }
                entity.isDeleted = false;
                var currentEntity = context.ServiceVariant.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.serviceVariantId != Guid.Empty)
                    return new Response(true, $"{entity.serviceVariantId} added successfully") { Data = currentEntity };
                else
                    return new Response(false, "Error occurred while adding the Service Variant");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred adding new Service Variant");
            }
        }

        public async Task<Response> DeleteAsync(ServiceVariant entity)
        {
            try
            {
                var serviceVariant = await GetByIdAsync(entity.serviceVariantId);

                serviceVariant.isDeleted = true;
                context.ServiceVariant.Update(serviceVariant);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.serviceVariantId} is marked as soft deleted successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing soft delete on service variant");
            }
        }

        public async Task<Response> DeleteSecondAsync(ServiceVariant entity)
        {
            try
            {
                var serviceVariant = await GetByIdAsync(entity.serviceVariantId);

                context.ServiceVariant.Remove(serviceVariant);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.serviceVariantId} is marked as deleted permanently successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing delete permanently on service variant");
            }
        }

        public async Task<bool> CheckIfServiceHasVariant(Guid serviceId)
        {
            try
            {
                var flag = await context.ServiceVariant
                                           .AnyAsync(b => b.serviceId == serviceId);
                return flag;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred when checking");
            }
        }

        public async Task<Response> DeleteByServiceIdAsync(Guid serviceId)
        {
            try
            {
                var variants = await context.ServiceVariant
                                          .Where(b => b.isDeleted == false && b.serviceId == serviceId)
                                          .ToListAsync();
                foreach (var variant in variants)
                {
                    variant.isDeleted = true;
                    context.ServiceVariant.Update(variant);
                    await context.SaveChangesAsync();
                }
                return new Response(true, $"Service variants with service ID {serviceId} is marked as soft deleted successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing soft delete on service variants with service ID");
            }
        }

        public async Task<bool> CheckIfVariantInBooking(Guid serviceVariantId)
        {
            try
            {
                var flag = await context.bookingServiceItems
                    .AnyAsync(p => p.ServiceVariantId == serviceVariantId);

                return flag;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred when checking");
            }
        }

        public async Task<IEnumerable<ServiceVariant>> GetAllAsync()
        {
            try
            {
                var serviceVariants = await context.ServiceVariant
                                          .ToListAsync();
                return serviceVariants ?? new List<ServiceVariant>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving service variants");
            }
        }

        public async Task<IEnumerable<ServiceVariant>> GetAllVariantsAsync(Guid id)
        {
            try
            {
                var serviceVariants = await context.ServiceVariant.Where(p => p.serviceId == id).ToListAsync();
                return serviceVariants ?? new List<ServiceVariant>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving service variants");
            }
        }

        public async Task<ServiceVariant> GetByAsync(Expression<Func<ServiceVariant, bool>> predicate)
        {
            try
            {
                var serviceVariant = await context.ServiceVariant.Where(predicate).FirstOrDefaultAsync();

                return serviceVariant ?? null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);

                throw new InvalidOperationException("Error occurred retrieving service variant", ex);
            }
        }

        public async Task<ServiceVariant> GetByIdAsync(Guid id)
        {
            try
            {
                var serviceVariant = await context.ServiceVariant.FindAsync(id);
                return serviceVariant != null ? serviceVariant : null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving service variant");
            }
        }

        public async Task<Response> UpdateAsync(ServiceVariant entity)
        {
            try
            {
                var serviceVariant = await GetByIdAsync(entity.serviceVariantId);

                serviceVariant.servicePrice = entity.servicePrice;
                serviceVariant.serviceContent = entity.serviceContent;
                serviceVariant.isDeleted = entity.isDeleted;
                serviceVariant.updateAt = DateTime.Now;
                context.ServiceVariant.Update(serviceVariant);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.serviceVariantId} is updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating the service variant");
            }
        }
    }
}
