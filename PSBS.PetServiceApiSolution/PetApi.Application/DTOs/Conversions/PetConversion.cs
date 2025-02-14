using PetApi.Application.DTOs;
using PetApi.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

namespace PetApi.Application.DTOs.Conversions
{
    public static class PetConversion
    {
        public static Pet ToEntity(PetDTO petDTO)
        {
            return new Pet
            {
                Pet_ID = petDTO.petId,
                Pet_Name = petDTO.petName,
                Pet_Gender = petDTO.petGender,
                Pet_Note = petDTO.petNote,
                Pet_Image = petDTO.petImage,
                Date_Of_Birth = petDTO.dateOfBirth,
                Pet_Weight = petDTO.petWeight,
                Pet_FurType = petDTO.petFurType,
                Pet_FurColor = petDTO.petFurColor,
                IsDelete = petDTO.isDelete ?? false,
                PetBreed_ID = petDTO.petBreedId,
                Account_ID = petDTO.accountId
            };
        }

        public static (PetDTO?, IEnumerable<PetDTO>?) FromEntity(
            Pet? pet,
            IEnumerable<Pet>? pets)
        {
            // Return single entity
            if (pet is not null && pets is null)
            {
                var singlePetDTO = new PetDTO
                {
                    petId = pet.Pet_ID,
                    petName = pet.Pet_Name,
                    petGender = pet.Pet_Gender,
                    petNote = pet.Pet_Note,
                    petImage = pet.Pet_Image,
                    dateOfBirth = pet.Date_Of_Birth,
                    petWeight = pet.Pet_Weight,
                    petFurType = pet.Pet_FurType,
                    petFurColor = pet.Pet_FurColor,
                    isDelete = pet.IsDelete,
                    petBreedId = pet.PetBreed_ID,
                    accountId = pet.Account_ID,
                    petTypeId = pet.PetBreed?.PetType?.PetType_ID
                };
                return (singlePetDTO, null);
            }

            // Return list of entities
            if (pets is not null && pet is null)
            {
                var petDTOs = pets.Select(p => new PetDTO
                {
                    petId = p.Pet_ID,
                    petName = p.Pet_Name,
                    petGender = p.Pet_Gender,
                    petNote = p.Pet_Note,
                    petImage = p.Pet_Image,
                    dateOfBirth = p.Date_Of_Birth,
                    petWeight = p.Pet_Weight,
                    petFurType = p.Pet_FurType,
                    petFurColor = p.Pet_FurColor,
                    isDelete = p.IsDelete,
                    petBreedId = p.PetBreed_ID,
                    accountId = p.Account_ID,
                    petTypeId = p.PetBreed?.PetType?.PetType_ID
                }).ToList();

                return (null, petDTOs);
            }

            return (null, null);
        }
    }
}
