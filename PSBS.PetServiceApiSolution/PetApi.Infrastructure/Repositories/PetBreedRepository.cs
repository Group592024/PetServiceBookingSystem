using Microsoft.EntityFrameworkCore;
using PetApi.Application.DTOs;
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
                var existingBreedById = await context.PetBreeds
                                                      .FirstOrDefaultAsync(b => b.PetBreed_ID == entity.PetBreed_ID);
                if (existingBreedById != null)
                {
                    return new Response(false, $"PetBreed with ID {entity.PetBreed_ID} already exists!");
                }

                var existingBreedByName = await context.PetBreeds
                                                       .FirstOrDefaultAsync(b => b.PetBreed_Name == entity.PetBreed_Name);
                if (existingBreedByName != null)
                {
                    return new Response(false, $"PetBreed with Name {entity.PetBreed_Name} already exists!");
                }

                entity.IsDelete = false;
                var currentEntity = context.PetBreeds.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.PetBreed_ID != Guid.Empty)
                    return new Response(true, $"{entity.PetBreed_Name} added successfully") { Data = currentEntity }; 
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
                var petBreed = await context.PetBreeds.FirstOrDefaultAsync(b => b.PetBreed_ID == entity.PetBreed_ID);
                if (petBreed == null)
                {
                    return new Response(false, $"Pet breed with Name {entity.PetBreed_Name} not found.");
                }

                if (!petBreed.IsDelete)
                {
                    petBreed.IsDelete = true;
                    context.PetBreeds.Update(petBreed);
                    await context.SaveChangesAsync();
                    return new Response(true, $"Pet breed {entity.PetBreed_Name} has been soft deleted successfully.") { Data = petBreed };
                }

                var hasRelatedPets = await context.Pets.AnyAsync(p => p.PetBreed_ID == entity.PetBreed_ID);
                if (hasRelatedPets)
                {
                    return new Response(false, $"Cannot permanently delete Pet Breed {entity.PetBreed_Name} because there are pets using it.");
                }

                context.PetBreeds.Remove(petBreed);
                await context.SaveChangesAsync();

                return new Response(true, $"Pet breed {entity.PetBreed_Name} has been permanently deleted.");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "An error occurred while deleting the Pet Breed.");
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
                var existingBreed = await context.PetBreeds
                                                 .FirstOrDefaultAsync(b => b.PetBreed_Name == entity.PetBreed_Name && b.PetBreed_ID != entity.PetBreed_ID);
                if (existingBreed != null)
                {
                    return new Response(false, $"Pet breed with the name {entity.PetBreed_Name} already exists!");
                }

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

                return new Response(true, "Pet breed updated successfully");
            }
            catch (Exception ex)
            {
                return new Response(false, $"An error occurred: {ex.Message}");
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
