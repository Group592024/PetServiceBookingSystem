using System.ComponentModel.DataAnnotations;


namespace PSPS.AccountAPI.Application.DTOs
{
    public record ChangePasswordDTO
    (
    [Required] string CurrentPassword,
    [Required] string NewPassword,
    [Required] string ConfirmPassword
    );
}
