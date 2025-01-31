using Microsoft.EntityFrameworkCore;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace PetApi.Infrastructure.Repositories
{
    public class PetDiaryRepository(PetDbContext context) : IPetDiary
    {
        public async Task<(IEnumerable<PetDiary>, int totalRecords)> GetAllDiariesByPetIdsAsync(Guid id, int pageIndex = 1, int pageSize = 4)
        {
            try
            {
                var diaries = await context.PetDiarys
                    .Where(p => p.Pet_ID == id)
                    .OrderByDescending(p => p.Diary_Date)
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var totalRecords = await context.PetDiarys
                    .Where(p => p.Pet_ID == id)
                    .CountAsync();

                return (diaries ?? new List<PetDiary>(), totalRecords);
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving service diaries");
            }
        }


        public async Task<Response> CreateAsync(PetDiary entity)
        {
            try
            {
                // here we can add pets that have the same name !!!!
                //var getPet = await GetByAsync(_ => _.pet_Name!.Equals(entity.pet_Name));
                //if (getPet is not null && !string.IsNullOrEmpty(getPet.pet_Name))
                //    return new Response(false, $"{entity.pet_Name} already added");

                var currentEnity = context.PetDiarys.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEnity is not null)
                    return new Response(true, $"Pet Diary is added to database successfully");
                else
                    return new Response(false, $"Error occurred while adding Pet Diary");
            }
            catch (Exception ex)
            {
                //Log the orginal exception
                LogExceptions.LogException(ex);

                return new Response(false, "Error occurred adding new adding Pet Diary");
            }
        }

        public async Task<Response> DeleteAsync(PetDiary entity)
        {
            try
            {
                var PetDiary = await GetByIdAsync(entity.Diary_ID);
                if (PetDiary is null)
                    return new Response(false, $"Diary with ID {entity.Diary_ID} not found");
                //context.Entry(pet).State = EntityState.Detached;

                context.PetDiarys.Remove(PetDiary);
                await context.SaveChangesAsync();
                return new Response(true, $"Diary with ID {entity.Diary_ID} is deleted permanently successfully");
            }

            catch (Exception ex)
            {
                //Log the orginal exception
                LogExceptions.LogException(ex);

                return new Response(false, "Error occurred deleting pet diary");
            }

        }

        public async Task<IEnumerable<PetDiary>> GetAllAsync()
        {
            try
            {
                var pets = await context.PetDiarys.AsNoTracking().ToListAsync();
                return pets is not null ? pets : null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retriveving pet diaries");
            }

        }

        public async Task<PetDiary> GetByAsync(Expression<Func<PetDiary, bool>> predicate)
        {
            try
            {
                var pet = await context.PetDiarys.Where(predicate).FirstOrDefaultAsync()!;
                return pet is not null ? pet : null;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retriveving pet diary");
            }

        }

        public async Task<PetDiary> GetByIdAsync(Guid id)
        {
            try
            {
                var pet = await context.PetDiarys.FindAsync(id);
                return pet is not null ? pet : null;

            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retriveving pet diary");
            }


        }

        public async Task<Response> UpdateAsync(PetDiary entity)
        {
            try
            {
                var pet = await GetByIdAsync(entity.Diary_ID);

                if (pet is null)
                    return new Response(false, $"Diary with ID {entity.Diary_ID} not found");
                //context.Entry(pet).State = EntityState.Detached;
                pet.Diary_Content = entity.Diary_Content;
                pet.Diary_Date = entity.Diary_Date;

                context.PetDiarys.Update(pet);
                await context.SaveChangesAsync();
                return new Response(true, $"Diary with ID {entity.Diary_ID} is updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating exsiting pet diary");
            }

        }
    }
}
