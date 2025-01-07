using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace PetApi.Infrastructure.Repositories
{
    public class PetBreedRepository(PetDbContext context) : IPetBreed
    {
        public async Task<Response> CreateAsync(PetBreed entity)
        {
            try
            {
                //var petTypeExists = await context.PetTypes.AnyAsync(pt => pt.PetType_ID == entity.PetType_ID && !pt.IsDelete);
                //if (!petTypeExists)
                //{
                //    return new Response(false, $"PetType with ID {entity.PetType_ID} is not active or does not exist!");
                //}
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
                var petUsingPetBreed = await context.Pets
                                      .AnyAsync(p => p.PetBreed_ID == entity.PetBreed_ID);
                if (petUsingPetBreed)
                {
                    return new Response(false, $"Cannot delete Treatment with ID {entity.PetBreed_ID} because there are medicines using it.");
                }

                var breed = await GetByIdAsync(entity.PetBreed_ID);
                if (breed == null)
                    return new Response(false, $"{entity.PetBreed_ID} not found");

                if (breed.IsDelete == true)
                {
                    context.PetBreeds.Remove(breed);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.PetBreed_ID} has been permanently deleted");
                }
                else
                {
                    breed.IsDelete = true;
                    context.PetBreeds.Update(breed);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.PetBreed_ID} is marked as deleted successfully");
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing delete operation on pet breed");
            }
        }

        public async Task<IEnumerable<PetBreed>> GetAllAsync()
        {
            try
            {
                var breeds = await context.PetBreeds.ToListAsync();
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

        public async Task<PetBreed?> GetByIdAsync(Guid id)
        {
            try
            {
                var breed = await context.PetBreeds.FindAsync(id);
                if (breed == null)
                {
                    LogExceptions.LogException(new Exception($"Pet breed with ID {id} not found"));
                    return null;
                }
                return breed;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("An error occurred while retrieving the pet breed.", ex);
            }
        }

        public async Task<Response> UpdateAsync(PetBreed entity)
        {
            try
            {
                var breed = await GetByIdAsync(entity.PetBreed_ID);
                if (breed == null)
                {
                    return new Response(false, $"Pet breed with ID {entity.PetBreed_ID} not found");
                }

                breed.PetType_ID = entity.PetType_ID;
                breed.PetBreed_Name = entity.PetBreed_Name;
                breed.PetBreed_Description = entity.PetBreed_Description;
                breed.PetBreed_Image = entity.PetBreed_Image;
                breed.IsDelete = entity.IsDelete;
                context.PetBreeds.Update(breed);
                await context.SaveChangesAsync();
                return new Response(true, $"Pet breed with ID {entity.PetBreed_ID} updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "An error occurred while updating the pet breed");
            }
        }

        public async Task<IEnumerable<PetBreed>> GetBreedsByPetTypeIdAsync(Guid petTypeId)
        {
            try
            {
                var breeds = await context.PetBreeds
                                          .Where(b => b.PetType_ID == petTypeId && !b.IsDelete)
                                          .ToListAsync();
                return breeds ?? new List<PetBreed>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving pet breeds by PetType ID", ex);
            }
        }
        public async Task<IEnumerable<PetBreed>> ListAvailablePetBreedAsync()
        {
            try
            {
                var petbreeds = await context.PetBreeds
                                         .Where(r => !r.IsDelete)
                                         .ToListAsync();
                return petbreeds ?? new List<PetBreed>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving non-deleted rooms");
            }
        }

    }
}
