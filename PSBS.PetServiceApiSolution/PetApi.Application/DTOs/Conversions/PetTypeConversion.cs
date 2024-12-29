using PetApi.Domain.Entities;

namespace PetApi.Application.DTOs.Conversions
{
    public static class PetTypeConversion
    {
        public static PetType ToEntity(PetTypeDTO pet) => new PetType()
        {
            PetType_ID = pet.PetType_ID,
            PetType_Name = pet.PetType_Name,
            PetType_Description = pet.PetType_Description,
            PetType_Image = pet.PetType_Image,
            IsDelete = false
        };

        public static PetType ToEntity(CreatePetTypeDTO pet, string imagePath) => new PetType()
        {
            PetType_ID = Guid.NewGuid(),
            PetType_Name = pet.PetType_Name,
            PetType_Description = pet.PetType_Description,
            PetType_Image = imagePath,
            IsDelete = false
        };

        public static (PetTypeDTO?, IEnumerable<PetTypeDTO>?) FromEntity(PetType? pet, IEnumerable<PetType>? pets)
        {
            //return single
            if (pet is not null || pets is null)
            {
                var singlePet = new PetTypeDTO(
                    pet!.PetType_ID,
                    pet.PetType_Name,
                    pet.PetType_Image,
                    pet.PetType_Description);
                return (singlePet, null);
            }

            //return list
            if (pets is not null || pet is null)
            {
                var _pets = pets!.Select(p =>
                new PetTypeDTO(
                    p.PetType_ID,
                p.PetType_Name,
                p.PetType_Image,
                p.PetType_Description)).ToList();

                return (null, _pets);
            }

            return (null, null);

        }
    }

}

