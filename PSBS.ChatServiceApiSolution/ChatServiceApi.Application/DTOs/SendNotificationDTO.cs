

using System.ComponentModel.DataAnnotations;

namespace ChatServiceApi.Application.DTOs
{
    public record SendNotificationDTO
   (
        Guid notificationId,
      string NotificationTitle,
     string NotificationContent,
    [Required]
    List<ReceiverDTO> Receivers
        );
}
