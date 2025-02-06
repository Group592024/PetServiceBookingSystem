using Microsoft.EntityFrameworkCore;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;
using System.Text.Json;

namespace PetApi.Infrastructure.Repositories
{
    public class PetRepository : IPet
    {
        private readonly PetDbContext context;

        public PetRepository(PetDbContext context)
        {
            this.context = context;
        }

        public async Task<Response> CreateAsync(Pet entity)
        {
            try
            {
                var existingPetByName = await context.Pets
                                      .FirstOrDefaultAsync(p => p.Pet_Name == entity.Pet_Name && p.Account_ID == entity.Account_ID);

                if (existingPetByName != null)
                {
                    return new Response(false, $"Pet with Name {entity.Pet_Name} already exists in this account!");
                }

                entity.IsDelete = false;
                var currentEntity = context.Pets.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.Pet_ID != Guid.Empty)
                    return new Response(true, $"{entity.Pet_Name} added successfully");
                else
                    return new Response(false, "Error occurred while adding the pet");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred adding new pet");
            }
        }

        public async Task<Response> DeleteAsync(Pet entity)
        {
            try
            {
                var pet = await context.Pets.FirstOrDefaultAsync(p => p.Pet_ID == entity.Pet_ID);
                if (pet == null)
                {
                    return new Response(false, $"Pet with ID {entity.Pet_ID} not found.");
                }

                using (var httpClient = new HttpClient())
                {
                    var response = await httpClient.GetAsync($"http://localhost:5023/api/bookingServiceItem/check/{pet.Pet_ID}");
                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();

                        var hasBookings = JsonSerializer.Deserialize<bool>(jsonString); 

                        if (hasBookings)
                        {
                            return new Response(false, $"Pet {entity.Pet_Name} cannot be deleted because it has associated bookings.");
                        }
                    }
                    else
                    {
                        return new Response(false, "Failed to check bookings for the pet.");
                    }
                }

                if (!pet.IsDelete)
                {
                    pet.IsDelete = true; 
                    context.Pets.Update(pet);
                    await context.SaveChangesAsync();
                    return new Response(true, $"Pet {entity.Pet_Name} has been soft deleted successfully.");
                }

                context.Pets.Remove(pet);
                await context.SaveChangesAsync();

                return new Response(true, $"Pet {entity.Pet_Name} has been permanently deleted.");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "An error occurred while deleting the Pet.");
            }
        }

        public async Task<Pet?> GetByIdAsync(Guid id)
        {
            try
            {
                var pet = await context.Pets
                    .Include(p => p.PetBreed)       
                    .ThenInclude(b => b.PetType)    
                    .FirstOrDefaultAsync(p => p.Pet_ID == id);  

                if (pet == null)
                {
                    LogExceptions.LogException(new Exception($"Pet with ID {id} not found"));
                    return null;
                }
                return pet;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("An error occurred while retrieving the pet.", ex);
            }
        }

        public async Task<IEnumerable<Pet>> GetAllAsync()
        {
            try
            {
                var pets = await context.Pets.ToListAsync();
                return pets ?? new List<Pet>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving pets");
            }
        }

        public async Task<Response> UpdateAsync(Pet entity)
        {
            try
            {
                var existingPetByName = await context.Pets
                                      .FirstOrDefaultAsync(p => p.Pet_Name == entity.Pet_Name && p.Account_ID == entity.Account_ID
                                      && p.Pet_ID != entity.Pet_ID);

                if (existingPetByName != null)
                {
                    return new Response(false, $"Pet with Name {entity.Pet_Name} already exists!");
                }

                var petToUpdate = await context.Pets
                                                .FirstOrDefaultAsync(p => p.Pet_ID == entity.Pet_ID);
                if (petToUpdate == null)
                {
                    return new Response(false, $"Pet with ID {entity.Pet_ID} not found.");
                }

                petToUpdate.Pet_Name = entity.Pet_Name;
                petToUpdate.Pet_Gender = entity.Pet_Gender;
                petToUpdate.Pet_Note = entity.Pet_Note;
                petToUpdate.Pet_Image = entity.Pet_Image;
                petToUpdate.Date_Of_Birth = entity.Date_Of_Birth;
                petToUpdate.Pet_Weight = entity.Pet_Weight;
                petToUpdate.Pet_FurType = entity.Pet_FurType;
                petToUpdate.Pet_FurColor = entity.Pet_FurColor;
                petToUpdate.Account_ID = entity.Account_ID;
                petToUpdate.Health_Number = entity.Health_Number;
                petToUpdate.IsDelete = entity.IsDelete;
                petToUpdate.PetBreed_ID = entity.PetBreed_ID;

                await context.SaveChangesAsync();

                return new Response(true, "Pet updated successfully") { Data = petToUpdate };
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<IEnumerable<Pet>> ListAvailablePetAsync(Guid accountId)
        {
            try
            {
                var pets = await context.Pets
                                       .Where(r => !r.IsDelete && r.Account_ID == accountId)
                                       .ToListAsync();
                return pets ?? new List<Pet>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving non-deleted pets");
            }
        }

        public async Task<Pet> GetByAsync(Expression<Func<Pet, bool>> predicate)
        {
            try
            {
                var pet = await context.Pets.Where(predicate).FirstOrDefaultAsync();

                return pet ?? throw new InvalidOperationException("Pet not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving pet", ex);
            }
        }
    }
}
