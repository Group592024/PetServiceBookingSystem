using System.ComponentModel.DataAnnotations;

namespace PetApi.Domain.Entities
{
    public class PetDiary
    {
        [Key]
        public Guid Diary_ID { get; set; }
        public DateTime Diary_Date { get; set; }
        public string Diary_Content { get; set; }

        public Guid Pet_ID { get; set; }
        public Pet? Pet { get; set; }

    }
}
