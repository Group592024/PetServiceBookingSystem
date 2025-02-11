using PetApi.Application.DTOs;

namespace PetApi.Application.Interfaces
{
    public interface IReport
    {
        Task<Dictionary<string, int>>
            GetPetBreedByPetCoutDTO(IEnumerable<PetCountDTO> dtos);
    }
}
