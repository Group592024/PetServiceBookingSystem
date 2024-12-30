using System.ComponentModel.DataAnnotations;

namespace PetApi.Domain.Entities
{
    public class PetBreed
    {
        [Key]
        public Guid PetBreed_ID { get; set; }
        public string PetBreed_Name { get; set; }
        public string PetBreed_Description { get; set; }
        public string PetBreed_Image { get; set; }
        public bool IsDelete { get; set; }

        public Guid PetType_ID { get; set; }
        public PetType? PetType { get; set; }

        public virtual ICollection<Pet>? Pets { get; set; } = new List<Pet>();
    }
}
