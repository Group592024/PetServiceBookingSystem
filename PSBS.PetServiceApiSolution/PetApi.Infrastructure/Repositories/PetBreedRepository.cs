using Microsoft.EntityFrameworkCore;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace PetApi.Infrastructure.Repositories
{
    public class PetBreedRepository(PetDbContext context) : IPetBreed
    {
        public async Task<Response> CreateAsync(PetBreed entity)
        {
            try
            {
                var existingBreed = await context.PetBreeds.FirstOrDefaultAsync(b => b.PetBreed_ID == entity.PetBreed_ID);
                if (existingBreed != null)
                {
                    return new Response(false, $"PetBreed with ID {entity.PetBreed_ID} already exists!");
                }
                entity.IsDelete = false;
                var currentEntity = context.PetBreeds.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.PetBreed_ID != Guid.Empty)
                    return new Response(true, $"{entity.PetBreed_ID} added successfully");
                else
                    return new Response(false, "Error occurred while adding the pet breed");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred adding new pet breed");
            }
        }

        public async Task<Response> DeleteAsync(PetBreed entity)
        {
            try
            {
                var breed = await GetByIdAsync(entity.PetBreed_ID);
                if (breed == null)
                    return new Response(false, $"{entity.PetBreed_ID} not found");
                breed.IsDelete = true;
                context.PetBreeds.Update(breed);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.PetBreed_ID} is marked as deleted successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing soft delete on pet breed");
            }
        }

        public async Task<Response> DeleteByPetTypeIdAsync(Guid petTypeId)
        {
            try
            {
                var breeds = await context.PetBreeds
                                          .Where(b => b.IsDelete == false && b.PetType_ID == petTypeId)
                                          .ToListAsync();
                foreach (var breed in breeds)
                {
                    breed.IsDelete = true;
                    context.PetBreeds.Update(breed);
                    await context.SaveChangesAsync();
                }
                return new Response(true, $"Pet breeds with pet type ID {petTypeId} is marked as soft deleted successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing soft delete on pet breed with pet type ID");
            }
        }

        public async Task<bool> CheckIfPetTypeHasPetBreed(Guid petTypeId)
        {
            try
            {
                var flag = await context.PetBreeds
                                           .AnyAsync(b => b.PetType_ID == petTypeId);
                return flag;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred when checking");
            }
        }

        public async Task<IEnumerable<PetBreed>> GetAllAsync()
        {
            try
            {
                var breeds = await context.PetBreeds
                                          .Where(b => b.IsDelete == false)
                                          .ToListAsync();
                return breeds ?? new List<PetBreed>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving pet breeds");
            }
        }

        public async Task<PetBreed> GetByAsync(Expression<Func<PetBreed, bool>> predicate)
        {
            try
            {
                var breed = await context.PetBreeds.Where(predicate).FirstOrDefaultAsync();

                return breed ?? throw new InvalidOperationException("Pet breed not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving pet breed", ex);
            }
        }

        public async Task<PetBreed> GetByIdAsync(Guid id)
        {
            try
            {
                var breed = await context.PetBreeds.FindAsync(id);
                return breed ?? throw new InvalidOperationException("Pet breed not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving pet breed");
            }
        }

        public async Task<Response> UpdateAsync(PetBreed entity)
        {
            try
            {
                var breed = await GetByIdAsync(entity.PetBreed_ID);
                if (breed == null)
                    return new Response(false, $"{entity.PetBreed_ID} not found");
                breed.IsDelete = false;
                breed.PetType_ID = entity.PetType_ID;
                breed.PetBreed_Name = entity.PetBreed_Name;
                breed.PetBreed_Description = entity.PetBreed_Description;
                breed.PetBreed_Image = entity.PetBreed_Image;
                context.PetBreeds.Update(breed);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.PetBreed_ID} is updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating the pet breed");
            }
        }
    }
}
