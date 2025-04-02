using System.ComponentModel.DataAnnotations;

namespace PetApi.Application.DTOs
{
    public record UpdatePetDiaryDTO
    {
        [Required]
        public string Diary_Content { get; set; }
        [Required]
        public string Category { get; set; }

    }
}
