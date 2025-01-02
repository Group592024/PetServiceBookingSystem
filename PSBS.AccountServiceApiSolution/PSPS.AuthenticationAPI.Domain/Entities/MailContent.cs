
using System.ComponentModel.DataAnnotations;


namespace PSPS.AccountAPI.Domain.Entities
{
    public class MailContent
    {
        [Required(ErrorMessage = "To field is required")]
        [EmailAddress(ErrorMessage = "Invalid email address in To field")]
        public string To { get; set; }

        [Required(ErrorMessage = "Subject is required")]
        public string Subject { get; set; }

        [Required(ErrorMessage = "Body is required")]
        public string Body { get; set; }
    }
}
