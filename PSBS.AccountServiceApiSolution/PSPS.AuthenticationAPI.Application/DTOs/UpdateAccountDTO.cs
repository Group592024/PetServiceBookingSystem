using System.ComponentModel.DataAnnotations;


namespace PSPS.AccountAPI.Application.DTOs
{
    public record UpdateAccountDTO(
         Guid AccountId,
         string? AccountName,
         [EmailAddress] string? AccountEmail,
         string? AccountPhoneNumber,
         string? AccountGender,
         DateTime? AccountDob,
         DateTime? CreatedAt,
         DateTime? UpdatedAt,
         string? AccountAddress,
         string? AccountImage,
         bool? isPickImage,
         string? RoleId,
         bool? AccountIsDeleted
        );
}
