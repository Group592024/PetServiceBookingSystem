namespace PetApi.Application.DTOs
{
    public record PetDiaryDTO
    {
        public Guid Diary_ID { get; set; }
        public DateTime Diary_Date { get; set; }
        public string Diary_Content { get; set; }
        public PetDTO Pet { get; set; }
    }
}
