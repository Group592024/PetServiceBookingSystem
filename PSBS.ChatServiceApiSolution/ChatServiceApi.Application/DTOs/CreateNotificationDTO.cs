

using System.ComponentModel.DataAnnotations;

namespace ChatServiceApi.Application.DTOs
{
    public record CreateNotificationDTO
     (
    [Required]
     Guid NotiTypeId,
    [Required]
     string NotificationTitle,
    [Required]
     string NotificationContent

        );
   
}
