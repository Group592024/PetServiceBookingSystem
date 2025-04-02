
using System.ComponentModel.DataAnnotations;

namespace ChatServiceApi.Application.DTOs
{
    public record PushNotificationDTO
   (
    [Required]
    Guid notificationId,
    [Required]
    List<ReceiverDTO> Receivers,
    bool isEmail
        );
}
