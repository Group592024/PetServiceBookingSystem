using System;
using System.ComponentModel.DataAnnotations;


namespace PSPS.AccountAPI.Application.DTOs
{
    public record AccountDTO(
        [Required] Guid AccountId,
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
