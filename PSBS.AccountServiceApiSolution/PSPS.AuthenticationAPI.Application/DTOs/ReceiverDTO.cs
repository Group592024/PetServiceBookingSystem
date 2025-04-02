using System.ComponentModel.DataAnnotations;

namespace PSPS.AccountAPI.Application.DTOs
{
    public record ReceiverDTO(
    [Required]
        Guid UserId
);
}
