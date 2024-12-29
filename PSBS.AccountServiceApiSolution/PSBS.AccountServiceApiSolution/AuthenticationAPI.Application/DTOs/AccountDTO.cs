using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.Application.DTOs
{
    public record AccountDTO(
        [Required] string AccountGuId,
        [Required] string AccountName,
        [Required, EmailAddress] string AccountEmail,
        [Required] string AccountPhoneNumber,
        [Required] string AccountPassword,
        [Required] string AccountGender,
        [Required] DateTime AccountDob,
        [Required] string AccountAddress,
        [Required] string AccountImage,
        [Required] int AccountLoyaltyPoint,
        [Required] bool AccountIsDeleted,
        [Required] string RoleId
        );
  
}
