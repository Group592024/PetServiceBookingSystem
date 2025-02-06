namespace PetApi.Application.DTOs
{
    public record CreatePetDiaryDTO
    {
        public string Diary_Content { get; set; }
        public Guid Pet_ID { get; set; }
    }
}
