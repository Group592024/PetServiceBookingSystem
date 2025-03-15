namespace PetApi.Application.DTOs
{
    public record UpdatePetDiaryDTO
    {
        public string Diary_Content { get; set; }
        public string Category { get; set; }

    }
}
