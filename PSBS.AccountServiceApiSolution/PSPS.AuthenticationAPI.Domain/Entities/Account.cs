using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace PSPS.AccountAPI.Domain.Entities
{
    public class Account
    {
        [Key]
        public Guid? AccountId { get; set; } // Primary Key

        public string? AccountName { get; set; }

        [EmailAddress]
        public string? AccountEmail { get; set; }

        [Phone]
        public string? AccountPhoneNumber { get; set; }

        public string? AccountPassword { get; set; }

        public string? AccountGender { get; set; }

        public DateTime? AccountDob { get; set; }

        public string? AccountAddress { get; set; }

        public string? AccountImage { get; set; }

        public int AccountLoyaltyPoint { get; set; }

        public bool AccountIsDeleted { get; set; }
        [ForeignKey("Role")]
        public string RoleId { get; set; }

       
        public virtual Role Role { get; set; }

    }

}

