namespace PetApi.Application.DTOs
{
    public record PetDTO
    {
        public string Pet_Name { get; set; }
        public string? Pet_Image { get; set; }
        public DateTime Date_Of_Birth { get; set; }
    }
}
