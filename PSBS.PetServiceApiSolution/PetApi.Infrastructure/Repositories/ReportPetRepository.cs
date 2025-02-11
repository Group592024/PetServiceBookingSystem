using Microsoft.EntityFrameworkCore;
using PetApi.Application.DTOs;
using PetApi.Application.Interfaces;
using PetApi.Infrastructure.Data;

namespace PetApi.Infrastructure.Repositories
{
    public class ReportPetRepository(PetDbContext context) : IReport
    {
        public async Task<Dictionary<string, int>>
            GetPetBreedByPetCoutDTO(IEnumerable<PetCountDTO> dtos)
        {
            var petDictionary = await context.Pets.Include(p => p.PetBreed)
                .ToDictionaryAsync(s => s.Pet_ID, s => s.PetBreed.PetBreed_Name);

            var petBreedDictionary = new Dictionary<string, int>();

            foreach (var pet in dtos)
            {
                if (petDictionary.TryGetValue(pet.petId, out var breedName))
                {
                    if (petBreedDictionary.ContainsKey(breedName))
                    {
                        petBreedDictionary[breedName] += pet.count;
                    }
                    else
                    {
                        petBreedDictionary[breedName] = pet.count;
                    }
                }
            }

            Console.WriteLine("dictionary day nay" + petBreedDictionary);
            Console.WriteLine(string.Join(", ", petBreedDictionary.Select(p => $"{p.Key}:{p.Value}")));


            return petBreedDictionary;
        }
    }
}
