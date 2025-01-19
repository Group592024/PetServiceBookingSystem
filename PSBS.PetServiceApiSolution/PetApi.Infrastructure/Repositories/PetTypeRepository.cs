using Microsoft.EntityFrameworkCore;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace PetApi.Infrastructure.Repositories
{
    public class PetTypeRepository(PetDbContext context) : IPetType
    {
        public async Task<Response> CreateAsync(PetType entity)
        {
            try
            {
                // here we can add pets that have the same name !!!!
                //var getPet = await GetByAsync(_ => _.pet_Name!.Equals(entity.pet_Name));
                //if (getPet is not null && !string.IsNullOrEmpty(getPet.pet_Name))
                //    return new Response(false, $"{entity.pet_Name} already added");

                var currentEnity = context.PetTypes.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEnity is not null)
                    return new Response(true, $"{entity.PetType_Name} added to database successfully");
                else
                    return new Response(false, $"Error occurred while adding {entity.PetType_Name}");
            }
            catch (Exception ex)
            {
                //Log the orginal exception
                LogExceptions.LogException(ex);

                return new Response(false, "Error occurred adding new pet type");
            }
        }

        public async Task<Response> DeleteAsync(PetType entity)
        {
            try
            {
                var petType = await GetByIdAsync(entity.PetType_ID);
                if (petType is null)
                    return new Response(false, $"{entity.PetType_Name} not found");
                //context.Entry(pet).State = EntityState.Detached;
                petType.IsDelete = true;

                context.PetTypes.Update(petType);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.PetType_Name} is marked as soft deleted  successfully");
            }

            catch (Exception ex)
            {
                //Log the orginal exception
                LogExceptions.LogException(ex);

                return new Response(false, "Error occurred soft deleting pet type");
            }

        }

        public async Task<Response> DeleteSecondAsync(PetType entity)
        {
            try
            {
                var petType = await GetByIdAsync(entity.PetType_ID);

                context.PetTypes.Remove(petType);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.PetType_ID} is deleted permanently successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing delete permanently on pet type");
            }
        }


        public async Task<IEnumerable<PetType>> GetAllAsync()
        {
            try
            {
                var pets = await context.PetTypes.AsNoTracking().ToListAsync();
                return pets is not null ? pets : null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retriveving pet type");
            }

        }

        public async Task<PetType> GetByAsync(Expression<Func<PetType, bool>> predicate)
        {
            try
            {
                var pet = await context.PetTypes.Where(predicate).FirstOrDefaultAsync()!;
                return pet is not null ? pet : null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retriveving pet type");
            }

        }

        public async Task<PetType> GetByIdAsync(Guid id)
        {
            try
            {
                var pet = await context.PetTypes.FindAsync(id);
                return pet is not null ? pet : null;

            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retriveving pet type");
            }


        }

        public async Task<Response> UpdateAsync(PetType entity)
        {
            try
            {
                var pet = await GetByIdAsync(entity.PetType_ID);

                if (pet is null)
                    return new Response(false, $"{entity.PetType_Name} not found");
                //context.Entry(pet).State = EntityState.Detached;
                pet.PetType_Name = entity.PetType_Name;
                pet.PetType_Image = entity.PetType_Image;
                pet.PetType_Description = entity.PetType_Description;
                pet.IsDelete = entity.IsDelete;
                context.PetTypes.Update(pet);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.PetType_Name} is updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating exsiting pet type");
            }

        }
        public async Task<IEnumerable<PetType>> ListAvailablePetTypeAsync()
        {
            try
            {
                var pettypes = await context.PetTypes
                                         .Where(r => !r.IsDelete)
                                         .ToListAsync();
                return pettypes ?? new List<PetType>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving non-deleted rooms");
            }
        }

    }
}
