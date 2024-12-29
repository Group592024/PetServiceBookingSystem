using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.Domain.Entities
{
    public class Account
    {
        [Key]
        public string? AccountGuId { get; set; } // Primary Key

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

