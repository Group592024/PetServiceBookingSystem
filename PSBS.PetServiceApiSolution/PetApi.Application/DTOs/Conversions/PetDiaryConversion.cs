using PetApi.Domain.Entities;

namespace PetApi.Application.DTOs.Conversions
{
    public class PetDiaryConversion
    {
        public static PetDiary ToEntity(PetDiaryDTO petDiary) => new PetDiary()
        {
            Diary_ID = petDiary.Diary_ID,
            Diary_Content = petDiary.Diary_Content,
            Diary_Date = petDiary.Diary_Date,
        };

        public static PetDiary ToEntity(CreatePetDiaryDTO pet) => new PetDiary()
        {
            Diary_ID = Guid.NewGuid(),
            Diary_Content = pet.Diary_Content,
            Diary_Date = DateTime.Now,
            Pet_ID = pet.Pet_ID,
        };

        public static PetDiary ToEntity(UpdatePetDiaryDTO pet) => new PetDiary()
        {
            Diary_ID = Guid.NewGuid(),
            Diary_Content = pet.Diary_Content,
            Diary_Date = DateTime.Now,
        };

        public static (PetDiaryDTO?, IEnumerable<PetDiaryDTO>?) FromEntity(PetDiary? petDiary, IEnumerable<PetDiary>? petDiaries)
        {
            //return single
            if (petDiary is not null && petDiaries is null)
            {
                var singlePetDiary = new PetDiaryDTO
                {
                    Diary_ID = petDiary.Diary_ID,
                    Diary_Content = petDiary.Diary_Content,
                    Diary_Date = petDiary.Diary_Date,
                    Pet = new PetDTO
                    {
                        Pet_Name = petDiary.Pet.Pet_Name,
                        Pet_Image = petDiary.Pet.Pet_Image,
                        Date_Of_Birth = petDiary.Pet.Date_Of_Birth,

                    }
                };
                return (singlePetDiary, null);
            }

            //return list
            if (petDiaries is not null && petDiary is null)
            {
                var _petDiaries = petDiaries.Select(p => new PetDiaryDTO
                {
                    Diary_ID = p.Diary_ID,
                    Diary_Content = p.Diary_Content,
                    Diary_Date = p.Diary_Date,
                    Pet = new PetDTO
                    {
                        Pet_Name = p.Pet.Pet_Name,
                        Pet_Image = p.Pet.Pet_Image,
                        Date_Of_Birth = p.Pet.Date_Of_Birth,

                    }
                }).ToList();

                return (null, _petDiaries);
            }

            return (null, null);
        }

    }
}
