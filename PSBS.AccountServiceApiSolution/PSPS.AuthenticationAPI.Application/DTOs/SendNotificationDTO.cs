using System.ComponentModel.DataAnnotations;

namespace PSPS.AccountAPI.Application.DTOs
{
    public record SendNotificationDTO
   (
      string NotificationTitle,
     string NotificationContent,
    [Required]
    List<ReceiverDTO> Receivers
        );
}
