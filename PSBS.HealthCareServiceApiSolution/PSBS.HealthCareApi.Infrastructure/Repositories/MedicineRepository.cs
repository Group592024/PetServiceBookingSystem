using Microsoft.AspNetCore.Components.Server;
using Microsoft.EntityFrameworkCore;
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
                if (existingMedicine != null)
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
                return new Response(false, "Error occured creating the medicine");
            }
        }

        public async Task<Response> DeleteAsync(Medicine entity)
        {
            try
            {
                var medicine = await GetByIdAsync(entity.medicineId);
                if(medicine == null)
                {
                    return new Response(false, "Medicine can't not found");
                }
                medicine.isDeleted = true;
                context.Medicines.Update(medicine);
                context.SaveChanges();
                return new Response(true, "Medicine is deleted successfully");
            }
            catch (Exception ex)
            {
                return new Response(false, "Error occured removing the medication");
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
                var medicine = await context.Medicines.FirstOrDefaultAsync(m => m.medicineId == id && m.isDeleted == false);
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
                if (existingMedicine == null)
                {
                    return new Response(false, "The medication can't not found");
                }
                existingMedicine.treatmentId = entity.treatmentId;
                existingMedicine.medicineName = entity.medicineName;
                existingMedicine.medicineImage = entity.medicineImage;
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
