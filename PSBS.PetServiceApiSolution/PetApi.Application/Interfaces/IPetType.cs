using PetApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Application.Interfaces
{
    public interface IPetType : IGenericInterface<PetType>
    {
        Task<Response> DeleteSecondAsync(PetType entity);
    }
}
