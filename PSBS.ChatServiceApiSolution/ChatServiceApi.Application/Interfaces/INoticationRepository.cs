using ChatServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Responses;


namespace ChatServiceApi.Application.Interfaces
{
    public interface INoticationRepository
    {
        Task<IEnumerable<NotificationBox>> GetNotificationsByUserIdAsync(Guid userId);
        Task<IEnumerable<Notification>> GetNotifications();
        Task<Response> CreateNotification(Notification notification, List<Guid> guids);
        Task<Response> DetelteNotification(Guid NotificationBoxId);
        
    }
}
