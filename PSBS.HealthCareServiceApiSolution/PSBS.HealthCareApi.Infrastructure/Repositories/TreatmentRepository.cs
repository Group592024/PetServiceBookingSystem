using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace PSBS.HealthCareApi.Infrastructure.Repositories
{
    public class TreatmentRepository(HealthCareDbContext context) : ITreatment
    {
        public async Task<Response> CreateAsync(Treatment entity)
        {
            try
            {
                var existingTreatment = await context.Treatments.FirstOrDefaultAsync(t => t.treatmentId == entity.treatmentId);
                if (existingTreatment != null)
                {
                    return new Response(false, $"Treatment with ID {entity.treatmentId} already exists!");
                }
                entity.isDeleted = false;
                var currentEntity = context.Treatments.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.treatmentId != Guid.Empty)
                    return new Response(true, $"{entity.treatmentId} added successfully");
                else
                    return new Response(false, "Error occurred while adding the treatment");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred adding new Treatment: {ex.Message}");
            }
        }
        public async Task<Response> DeleteAsync(Treatment entity)
        {
            try
            {
                var treatment = await context.Treatments.FirstOrDefaultAsync(m => m.treatmentId == entity.treatmentId);
                if (treatment == null)
                {
                    return new Response(false, "Treatment not found.");
                }

                if (treatment.isDeleted)
                {
                    var medicineUsingTreatment = await context.Medicines
                                                               .AnyAsync(m => m.treatmentId == entity.treatmentId);
                    if (medicineUsingTreatment)
                    {
                        return new Response(false, $"Cannot permanently delete Treatment with Name {entity.treatmentName} because there are medicines using it.");
                    }

                    context.Treatments.Remove(treatment);
                    await context.SaveChangesAsync();

                    return new Response(true, $"Treatment with Name {entity.treatmentName} has been permanently deleted.");
                }
                else
                {
                    treatment.isDeleted = true;
                    context.Treatments.Update(treatment);

                    var relatedMedicines = await context.Medicines
                                                         .Where(m => m.treatmentId == entity.treatmentId)
                                                         .ToListAsync();

                    foreach (var medicine in relatedMedicines)
                    {
                        medicine.isDeleted = true;
                        context.Medicines.Update(medicine);
                    }

                    await context.SaveChangesAsync();
                    return new Response(true, "Treatment and related medicines soft deleted successfully.");
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred while deleting Treatment: {ex.Message}");
            }
        }

        public async Task<IEnumerable<Treatment>> GetAllAsync()
        {
            try
            {
                var treatments = await context.Treatments
                          .ToListAsync();
                return treatments ?? new List<Treatment>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving Treatment: {ex.Message}");
            }
        }

        public async Task<Treatment> GetByAsync(Expression<Func<Treatment, bool>> predicate)
        {
            try
            {
                var treatment = await context.Treatments.Where(predicate).FirstOrDefaultAsync();
                return treatment ?? throw new InvalidOperationException("Treatemnt not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving Treatment by condition: {ex.Message}");
            }
        }

        public async Task<Treatment> GetByIdAsync(Guid id)
        {
            try
            {
                var treatment = await context.Treatments.FindAsync(id);
                if (treatment == null)
                {
                    LogExceptions.LogException(new Exception($"Treatment with ID {id} not found"));
                    return null;
                }
                return treatment;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving Treatment by Id: {ex.Message}");
            }
        }

        public async Task<Response> UpdateAsync(Treatment entity)
        {
            try
            {
                var existingTreatment = await GetByIdAsync(entity.treatmentId);
                if (existingTreatment == null)
                {
                    return new Response(false, $"Treatment with ID {entity.treatmentId} not found or already deleted");
                }

                existingTreatment.treatmentName = entity.treatmentName;
                existingTreatment.isDeleted = entity.isDeleted;

                context.Treatments.Update(existingTreatment);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.treatmentId} updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred updating the Treatment: {ex.Message}");
            }
        }
        public async Task<IEnumerable<Treatment>> ListAvailableTreatmentAsync()
        {
            try
            {
                var treatements = await context.Treatments
                                         .Where(r => !r.isDeleted)
                                         .ToListAsync();
                return treatements ?? new List<Treatment>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving non-deleted treatments");
            }
        }

    }
}
