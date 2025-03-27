

namespace ChatServiceApi.Application.DTOs
{
    public record UserNotificationDTO
    (
     Guid NotificationId,
     Guid UserId,
     string NotiTypeName,
     string NotificationTitle,
     string NotificationContent,
     DateTime CreatedDate,
     bool IsDeleted
        );
}
