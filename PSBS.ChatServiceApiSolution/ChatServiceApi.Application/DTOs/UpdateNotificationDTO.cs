using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServiceApi.Application.DTOs
{
    public record UpdateNotificationDTO
     (
    Guid notificationId,
    [Required]
     Guid NotiTypeId,
    [Required]
     string NotificationTitle,
    [Required]
     string NotificationContent,
    [Required]
    bool IsDeleted

        );
}
