using Microsoft.AspNetCore.Components.Server;
using Microsoft.EntityFrameworkCore;
using PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Infrastructure.Repositories
{
    public class MedicineRepository(HealthCareDbContext context) : IMedicine
    {
        public async Task<Response> CreateAsync(Medicine entity)
        {
            try
            {
                var existingMedicine = await GetByIdAsync(entity.medicineId);
                var existingMedicineName = context.Medicines.FirstOrDefault(m => m.medicineName.Equals(entity.medicineName));
                if (existingMedicine != null || existingMedicineName != null)
                {
                    return new Response(false, $"{entity.medicineName} already exist! ");
                }
                entity.isDeleted = false;
                var currentMedicine = context.Medicines.Add(entity).Entity;
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.medicineName} is created successfully");
            }
            catch (Exception ex)
            {
                return new Response(false, $"Error occurred creating the medicine: {ex.Message} - Inner Exception: {ex.InnerException?.Message}");
            }
        }

        public async Task<Response> DeleteAsync(Medicine entity)
        {
            try
            {
                if (!entity.isDeleted)
                {
                    var medicine = await GetByIdAsync(entity.medicineId);
                    if (medicine == null)
                    {
                        return new Response(false, "Medicine does not exist!");
                    }
                    medicine.isDeleted = true;
                    context.Medicines.Update(medicine);
                    await context.SaveChangesAsync();
                    return new Response(true, "Medicine is inactive successfully!");
                }

                var existUsingMedicine = await context.PetHealthBooks
                                                      .Where(hb => hb.Medicines.Any(m => m.medicineId == entity.medicineId))
                                                      .FirstOrDefaultAsync();

                if (existUsingMedicine != null)
                {
                    return new Response(false, "Medicine used in healthbook!");
                }

                // Nếu không còn sử dụng, tiến hành xóa Medicine
                context.Medicines.Remove(entity);
                await context.SaveChangesAsync();
                return new Response(true, "Medicine deleted successfully!");
            }
            catch (Exception ex)
            {
                return new Response(false, $"Exception Medicine: {ex.Message}");
            }
        }

        //Get a list of all medications including active or deleted
        public async Task<IEnumerable<Medicine>> GetAllAsync()
        {
            try
            {
                var listMedicines = await context.Medicines.ToListAsync();
                return listMedicines != null ? listMedicines : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving medication");
            }
        }

        public async Task<IEnumerable<Medicine>> GetAllAttributeAsync()
        {
            try
            {
                var listMedicines = await context.Medicines.ToListAsync();
                return listMedicines != null ? listMedicines : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving medication");
            }
        }

        public async Task<Medicine> GetByAsync(Expression<Func<Medicine, bool>> predicate)
        {
            try
            {
                var medicine = await context.Medicines.Where(predicate).FirstOrDefaultAsync()!;
                return medicine != null ? medicine : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving medication");
            }
        }

        public async Task<Medicine> GetByIdAsync(Guid id)
        {
            try
            {
                var medicine = await context.Medicines.FirstOrDefaultAsync(m => m.medicineId == id);
                return medicine != null ? medicine : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving medication");
            }
        }

        public async Task<Response> UpdateAsync(Medicine entity)
        {
            try
            {
                var existingMedicine = await GetByIdAsync(entity.medicineId);
                var existingMedicineName = context.Medicines.FirstOrDefault(m => m.medicineName.Equals(entity.medicineName) && m.medicineId != entity.medicineId);
                if (existingMedicine == null)
                {
                    return new Response(false, "The medication can't not found");
                }
                if (existingMedicineName != null)
                {
                    return new Response(false, "The medicine name is already exist.");
                }
                existingMedicine.treatmentId = entity.treatmentId;
                existingMedicine.medicineName = entity.medicineName;
                existingMedicine.medicineImage = entity.medicineImage;
                existingMedicine.isDeleted = entity.isDeleted;
                context.Entry(existingMedicine).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return new Response(true, " The medicine is updated successfully");
            }
            catch (Exception ex)
            {
                return new Response(false, "Error occured updating the medication");
            }
        }
    }
}
