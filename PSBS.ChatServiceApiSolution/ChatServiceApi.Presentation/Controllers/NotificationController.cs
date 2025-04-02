using Azure;
using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.DTOs.Conversions;
using ChatServiceApi.Application.Interfaces;

using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INoticationRepository _notificationRepository;
        private readonly INotificationMessagePublisher _notificationMessagePublisher;

        public NotificationController(INoticationRepository noticationRepository, INotificationMessagePublisher notificationMessagePublisher)
        {
          _notificationRepository = noticationRepository;
          _notificationMessagePublisher = notificationMessagePublisher;
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDTO createNotificationDTO)
        {       

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var notification = NotificationConversion.ToEntity(createNotificationDTO);          
            if(notification is null)
            {
                return Ok(new PSPS.SharedLibrary.Responses.Response(true, $"the notification data is not valid"));
            }

            var response = await _notificationRepository.CreateNotification(notification!);

            return Ok(response);
        }
        [HttpPost("push")]
        public async Task<IActionResult> PushNotification([FromBody] PushNotificationDTO pushNotificationDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var lists = NotificationConversion.GetUserIdsFromReceivers(pushNotificationDTO.Receivers);
                if (lists is null)
                {
                    return Ok(new PSPS.SharedLibrary.Responses.Response(true, $"the notification data is not valid"));
                }

                var response = new PSPS.SharedLibrary.Responses.Response();
                if (pushNotificationDTO.isEmail)
                {
                    var notification = await _notificationRepository.GetNotificationById(pushNotificationDTO.notificationId);
                    if(notification is null)
                    {
                        return NotFound();
                    }
                    var sendNoti = new SendNotificationDTO(pushNotificationDTO.notificationId, notification.NotificationTitle, notification.NotificationContent, pushNotificationDTO.Receivers);
                   response= await _notificationMessagePublisher.SendEmailNotificationMessageAsync(sendNoti);
                }
                else
                {
                    response = await _notificationMessagePublisher.BatchingPushNotificationAsync(pushNotificationDTO);
                }

                if (response.Flag)
                {
                    var result = await _notificationRepository.PushNotificationUsers(pushNotificationDTO.notificationId);
                    return Ok(result);
                }
                else
                {
                    return BadRequest(response); // Returns the response, indicating failure.
                }
            }
            catch (Exception ex) { 
            return BadRequest(new PSPS.SharedLibrary.Responses.Response(false, $"the error occur when pushing: "+ex));
            }
        }
        [HttpPut]
        public async Task<IActionResult> UpdateNotification([FromBody] UpdateNotificationDTO updateNotificationDTO)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var notification = NotificationConversion.UpdateToEntity(updateNotificationDTO);
            //var lists = NotificationConversion.GetUserIdsFromReceivers(createNotificationDTO.Receivers);
            if (notification is null )
            {
                return Ok(new PSPS.SharedLibrary.Responses.Response(false, $"the notification data is not valid"));
            }

            var response = await _notificationRepository.UpdateNotification(notification!);

            return Ok(response);
        }
        [HttpDelete("{notificationBoxId}")]
        public async Task<IActionResult> DeleteUserNotification(Guid notificationBoxId)
        {        
            var response = await _notificationRepository.DetelteNotification(notificationBoxId);

            return Ok(response);
        }
        [HttpDelete("user/{notificationBoxId}")]
        public async Task<IActionResult> DeleteNotification(Guid notificationBoxId)
        {
            var response = await _notificationRepository.DetelteUserNotification(notificationBoxId);

            return Ok(response);
        }
        [HttpDelete("user/isRead/{notificationBoxId}")]
        public async Task<IActionResult> SetIsReadNotification(Guid notificationBoxId)
        {
            var response = await _notificationRepository.SetNotificationIsRead(notificationBoxId);

            return Ok(response);
        }
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var notifications = await _notificationRepository.GetNotifications();
            var (_, list) = NotificationConversion.FromEntity(null!, notifications);
            if (list is null)
            {
                return Ok(new PSPS.SharedLibrary.Responses.Response(true, $"The list is empty"));
            }
            else
            {
                
                return Ok(new PSPS.SharedLibrary.Responses.Response(true, $"the notifications is retrieved successfully")
                {
                    Data = list
                });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetNotificationsByUserId(Guid userId)
        {
            var notifications = await _notificationRepository.GetNotificationsByUserIdAsync(userId);
            var (_, list) = NotificationConversion.FromEntityToUserNoti(null!, notifications);
            if (list is null)
            {
                return Ok(new PSPS.SharedLibrary.Responses.Response(true, $"The list is empty"));
            }
            else
            {

                return Ok(new PSPS.SharedLibrary.Responses.Response(true, $"the notifications is retrieved successfully")
                {
                    Data = list
                });
            }
        }

    }
}
