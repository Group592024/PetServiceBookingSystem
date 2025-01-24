using PetApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;

namespace PetApi.Application.Interfaces
{
    public interface IPetDiary : IGenericInterface<PetDiary>
    {
        Task<IEnumerable<PetDiary>> GetAllDiariesByPetIdsAsync(Guid id);
    }
}
