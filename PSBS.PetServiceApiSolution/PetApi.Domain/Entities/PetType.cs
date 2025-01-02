using System.ComponentModel.DataAnnotations;

namespace PetApi.Domain.Entities
{
    public class PetType
    {
        [Key]
        public Guid PetType_ID { get; set; }
        public string PetType_Name { get; set; }
        public string? PetType_Image { get; set; }
        public string PetType_Description { get; set; }
        public bool IsDelete { get; set; }

        public virtual ICollection<PetBreed>? PetBreeds { get; set; } = new List<PetBreed>();
    }
}
