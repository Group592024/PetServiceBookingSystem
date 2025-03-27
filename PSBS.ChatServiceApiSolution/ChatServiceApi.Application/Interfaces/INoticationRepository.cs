using ChatServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Responses;


namespace ChatServiceApi.Application.Interfaces
{
    public interface INoticationRepository
    {
        Task<IEnumerable<NotificationBox>> GetNotificationsByUserIdAsync(Guid userId);
        Task<IEnumerable<Notification>> GetNotifications();
        Task<Response> CreateNotification(Notification notification);
        Task<Response> DetelteUserNotification(Guid NotificationBoxId);
        Task<Response> PushNotificationUsers(Guid notificationId);
        Task<Response> UpdateNotification(Notification notification);
        Task<Response> DetelteNotification(Guid notificationId);
        Task<Response> SetNotificationIsRead(Guid notificationBoxId);
        Task<Response> PushSingleNotification(Guid notificationId, Guid guid);
        Task<int> CountUnreadNotificationsAsync(Guid userId);
    }
}
