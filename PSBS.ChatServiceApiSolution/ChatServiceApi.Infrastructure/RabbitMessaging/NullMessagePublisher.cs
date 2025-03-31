

using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Infrastructure.RabbitMessaging
{
    internal class NullMessagePublisher : INotificationMessagePublisher
    {
        public Task<Response> BatchingPushNotificationAsync(PushNotificationDTO pushNotification)
        {
            return Task.FromResult(new Response
            {
                Flag = false,
                Message = "RabbitMQ is not available. Message not published."
            });
        }
     

        public Task<Response> PublishNotificationMessageAsync(NotificationMessage message)
        {
            return Task.FromResult(new Response
            {
                Flag = false,
                Message = "RabbitMQ is not available. Message not published."
            });
        }

        public Task<Response> SendEmailNotificationMessageAsync(SendNotificationDTO sendNotification)
        {
            return Task.FromResult(new Response
            {
                Flag = false,
                Message = "RabbitMQ is not available. Message not published."
            });
        }
    }
    }
