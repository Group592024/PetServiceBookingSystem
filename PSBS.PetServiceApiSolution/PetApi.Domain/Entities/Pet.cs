
using System.ComponentModel.DataAnnotations;

namespace PetApi.Domain.Entities
{
    public class Pet
    {
        [Key]
        public Guid Pet_ID { get; set; }
        public string Pet_Name { get; set; }
        public bool Pet_Gender { get; set; }

        public string Pet_Note { get; set; }
        public string? Pet_Image { get; set; }
        public DateTime Date_Of_Birth { get; set; }
        public string Pet_Weight { get; set; }
        public string Pet_FurType { get; set; }
        public string Pet_FurColor { get; set; }
        public bool IsDelete { get; set; }


        public Guid PetBreed_ID { get; set; }
        public PetBreed? PetBreed { get; set; }

        public Guid Account_ID { get; set; }

        public virtual ICollection<PetDiary>? PetDiaries { get; set; } = new List<PetDiary>();

    }
}
