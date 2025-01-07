using PetApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;

namespace PetApi.Application.Interfaces
{
    public interface IPetBreed : IGenericInterface<PetBreed>
    {
        Task<IEnumerable<PetBreed>> GetBreedsByPetTypeIdAsync(Guid petTypeId);
        Task<IEnumerable<PetBreed>> ListAvailablePetBreedAsync();

    }
}
