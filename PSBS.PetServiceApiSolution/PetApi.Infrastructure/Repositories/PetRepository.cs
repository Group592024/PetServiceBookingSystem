using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace PetApi.Infrastructure.Repositories
{
    public class PetRepository(PetDbContext context) : IPet
    {
        public Task<Response> CreateAsync(Pet entity)
        {
            throw new NotImplementedException();
        }

        public Task<Response> DeleteAsync(Pet entity)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Pet>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Pet> GetByAsync(Expression<Func<Pet, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public async Task<Pet> GetByIdAsync(Guid id)
        {
            try
            {
                var pet = await context.Pets.FindAsync(id);
                return pet is not null ? pet : null;

            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retriveving pet");
            }


        }

        public Task<Response> UpdateAsync(Pet entity)
        {
            throw new NotImplementedException();
        }
    }
}
