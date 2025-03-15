using PetApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;

namespace PetApi.Application.Interfaces
{
    public interface IPetDiary : IGenericInterface<PetDiary>
    {
        Task<(IEnumerable<PetDiary>, int totalRecords)> GetAllDiariesByPetIdsAsync(string? category, Guid id, int pageIndex = 1, int pageSize = 4);
        Task<IEnumerable<string>> GetAllCategories(Guid petId);
        Task<IEnumerable<PetDiary>> GetDiariesByCategory(string category);
    }
}
