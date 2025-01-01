

namespace PSPS.AccountAPI.Domain.Entities
{
    public class Role
    {
        public string RoleId { get; set; } // Primary Key
        public string RoleName { get; set; }

        // Navigation property for Accounts
        public virtual ICollection<Account> Accounts { get; set; }
    }
}
