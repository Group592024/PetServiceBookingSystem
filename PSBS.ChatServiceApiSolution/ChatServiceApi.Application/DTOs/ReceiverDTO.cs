

using System.ComponentModel.DataAnnotations;

namespace ChatServiceApi.Application.DTOs
{
    public record ReceiverDTO(
    [Required]
        Guid UserId
);
}
