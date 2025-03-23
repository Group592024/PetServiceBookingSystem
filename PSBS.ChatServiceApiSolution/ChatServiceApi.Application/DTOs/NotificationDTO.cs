

namespace ChatServiceApi.Application.DTOs
{
    public record NotificationDTO
    (
     Guid NotificationId,
     string NotiTypeName ,
     string NotificationTitle, 
     string NotificationContent ,
     DateTime CreatedDate,
     bool IsDeleted,
     bool IsPushed

        );
}
