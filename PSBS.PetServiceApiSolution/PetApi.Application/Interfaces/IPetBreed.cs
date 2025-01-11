using PetApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;

namespace PetApi.Application.Interfaces
{
    public interface IPetBreed : IGenericInterface<PetBreed>
    {
        Task<Response> DeleteByPetTypeIdAsync(Guid petTypeId);
        Task<bool> CheckIfPetTypeHasPetBreed(Guid petTypeId);
        Task<IEnumerable<PetBreed>> GetBreedsByPetTypeIdAsync(Guid petTypeId);
        Task<IEnumerable<PetBreed>> ListAvailablePetBreedAsync();

    }
}
