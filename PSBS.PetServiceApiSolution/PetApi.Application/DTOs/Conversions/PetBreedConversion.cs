using PetApi.Application.DTOs;
using PetApi.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

namespace PetApi.Application.DTOs.Conversions
{
    public static class PetBreedConversion
    {
        public static PetBreed ToEntity(PetBreedDTO petBreedDTO)
        {
            return new PetBreed
            {
                PetBreed_ID = petBreedDTO.petBreedId,
                PetType_ID = petBreedDTO.petTypeId,
                PetBreed_Name = petBreedDTO.petBreedName,
                PetBreed_Description = petBreedDTO.petBreedDescription,
                PetBreed_Image = petBreedDTO.petBreedImage,
                //IsDelete = false
                IsDelete = petBreedDTO.isDelete ?? false
            };
        }

        public static (PetBreedDTO?, IEnumerable<PetBreedDTO>?) FromEntity(
            PetBreed? petBreed,
            IEnumerable<PetBreed>? petBreeds)
        {
            // Return single entity
            if (petBreed is not null && petBreeds is null)
            {
                var singlePetBreedDTO = new PetBreedDTO
                {
                    petBreedId = petBreed.PetBreed_ID,
                    petTypeId = petBreed.PetType_ID,
                    petBreedName = petBreed.PetBreed_Name,
                    petBreedDescription = petBreed.PetBreed_Description,
                    petBreedImage = petBreed.PetBreed_Image,
                    isDelete = petBreed.IsDelete
                };
                return (singlePetBreedDTO, null);
            }

            // Return list of entities
            if (petBreeds is not null && petBreed is null)
            {
                var petBreedDTOs = petBreeds.Select(p => new PetBreedDTO
                {
                    petBreedId = p.PetBreed_ID,
                    petTypeId = p.PetType_ID,
                    petBreedName = p.PetBreed_Name,
                    petBreedDescription = p.PetBreed_Description,
                    petBreedImage = p.PetBreed_Image,
                    isDelete = p.IsDelete
                }).ToList();

                return (null, petBreedDTOs);
            }

            return (null, null);
        }
    }
}
