
using ChatServiceApi.Application.DTOs;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Application.Interfaces
{
    public interface INotificationMessagePublisher
    {
        Task<Response> PublishNotificationMessageAsync(NotificationMessage message);
        Task<Response> BatchingPushNotificationAsync(PushNotificationDTO pushNotification);
    }
}
