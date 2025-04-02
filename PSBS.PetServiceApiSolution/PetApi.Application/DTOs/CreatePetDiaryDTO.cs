using System.ComponentModel.DataAnnotations;

namespace PetApi.Application.DTOs
{
    public record CreatePetDiaryDTO
    {
        [Required]
        public string Diary_Content { get; set; }
        [Required]
        public string Category { get; set; }
        [Required]
        public Guid Pet_ID { get; set; }
    }
}
