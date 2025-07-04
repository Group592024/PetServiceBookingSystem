﻿
using ChatServiceApi.Application.DTOs;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Application.Interfaces
{
    public interface INotificationMessagePublisher
    {
        Task<Response> SendEmailNotificationMessageAsync(SendNotificationDTO sendNotification);
        Task<Response> BatchingPushNotificationAsync(PushNotificationDTO pushNotification);
    }
}
