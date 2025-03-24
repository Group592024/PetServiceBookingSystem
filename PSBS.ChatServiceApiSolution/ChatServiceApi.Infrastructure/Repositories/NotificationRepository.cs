
using ChatServiceApi.Application.DTOs.Conversions;
using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using ChatServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Infrastructure.Repositories
{
    public class NotificationRepository(ChatServiceDBContext context) : INoticationRepository
    {

        public async Task<Response> CreateNotification(Notification notification)
        {
            try
            {
                context.Notifications.Add(notification);
                await context.SaveChangesAsync();

                // Fetch the Notification with NotificationType included
                var createdNotification = await context.Notifications
                    .Include(n => n.NotificationType)
                    .FirstOrDefaultAsync(n => n.NotificationId == notification.NotificationId);

                if (createdNotification != null)
                {
                    var (noti, _) = NotificationConversion.FromEntity(createdNotification, null); 
                    return new Response(true, "Notification added successfully") { Data = noti };
                }
                else
                {
                    return new Response(false, "Failed to add notification"); // Corrected to false
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred adding new notification");
            }
        }

        public async Task<Response> PushNotification(Guid notificationId, List<Guid> guids)
        {
            try
            {
                var currentNotification = await context.Notifications.FindAsync(notificationId);
                if (currentNotification == null)
                {
                    return new Response(false, $"the notification does not exist");
                }
                else
                {
                    currentNotification.IsPushed = true;
                    context.Notifications.Update(currentNotification);
                    foreach (var guid in guids)
                    {
                        var notiBox = new NotificationBox
                        {
                            NotificationId = currentNotification.NotificationId,
                            UserId = guid,
                            IsDeleted = false,
                            IsRead = false,
                        };
                        context.NotificationBoxes.Add(notiBox);
                    }

                    await context.SaveChangesAsync();
                    // Fetch the updated notification with NotificationType included
                    var updatedNotification = await context.Notifications
                        .Include(n => n.NotificationType)
                        .FirstOrDefaultAsync(n => n.NotificationId == currentNotification.NotificationId);

                    var (noti, _) = NotificationConversion.FromEntity(updatedNotification!, null);

                    return new Response(true, "Notification pushed successfully") { Data = noti };
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured pushing the notification");
            }
        }

        public async Task<Response> DetelteNotification( Guid notificationId)
        {
            try
            {
                var notification = await context.Notifications
                     .Include(n => n.NotificationType) // Include NotificationType here
                     .FirstOrDefaultAsync(n => n.NotificationId == notificationId);

                if (notification is null)
                {
                    return new Response(false, $"the notification does not exist");
                }
                if (!notification.IsDeleted) {
                notification.IsDeleted = true;
                    context.Notifications.Update(notification);
                    await context.SaveChangesAsync();
                    var (noti, list) = NotificationConversion.FromEntity(notification, null);
                    return new Response(true, $"The notification marked as deleted.") { Data = noti };
                }
                else
                {
                    bool isReferencedInBoxes = await context.NotificationBoxes.AnyAsync(n=> n.NotificationId == notification.NotificationId);
                    if (isReferencedInBoxes) {
                        return new Response(false, $"Cannot permanently delete because it is referenced in existing user notification.");
                    }                 
                    context.Notifications.Remove(notification);
                    await context.SaveChangesAsync();
                    return new Response(true, $"the notification is deleted permanently");
                   
                }
              
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured deleting the notification");
            }

        }

        public async Task<IEnumerable<Notification>> GetNotifications()
        {
           return await context.Notifications
                .Include(h=> h.NotificationType)
                .OrderByDescending(h=>h.CreatedDate)
                .ToListAsync();
        }
        public async Task<IEnumerable<NotificationBox>> GetNotificationsByUserIdAsync(Guid userId)
        {
            return await context.NotificationBoxes
            .Include(nb => nb.Notification)
            .ThenInclude(n => n.NotificationType) 
            .Where(nb => nb.UserId == userId && !nb.IsDeleted)
            .OrderByDescending(nb => nb.Notification.CreatedDate)
            .ToListAsync();
        }

        public async Task<Response> DetelteUserNotification(Guid NotificationBoxId)
        {
            try
            {
                var notification = await context.NotificationBoxes
                    .Include(nb => nb.Notification)
                    .ThenInclude(n => n.NotificationType)
                    .FirstOrDefaultAsync(n => n.NotiBoxId == NotificationBoxId);
                if (notification is null)
                {
                    return new Response(false, $"the notification does not exist");
                }
                notification.IsDeleted = true;
             var current =   context.Update(notification).Entity;
                await context.SaveChangesAsync();
                var (noti, list) = NotificationConversion.FromEntityToUserNoti(current, null);
                return new Response(true, $"the notification is deleted successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured deleting the notification");
            }
        }

        public async Task<Response> UpdateNotification(Notification notification)
        {
            try
            {
                var existingNoti = await context.Notifications
                    .Include(n => n.NotificationType)
                    .FirstOrDefaultAsync(n => n.NotificationId == notification.NotificationId);

                if (existingNoti is null)
                {
                    return new Response(false, "Notification does not exist");
                }

                // Update the existing entity
            notification.IsPushed = existingNoti.IsPushed;
            notification.CreatedDate = existingNoti.CreatedDate;
                context.Entry(existingNoti).CurrentValues.SetValues(notification);
                await context.SaveChangesAsync();

                // Fetch the updated notification with NotificationType included
                var updatedNotification = await context.Notifications
                    .Include(n => n.NotificationType)
                    .FirstOrDefaultAsync(n => n.NotificationId == notification.NotificationId);

                var (noti, _) = NotificationConversion.FromEntity(updatedNotification!, null); 

                return new Response(true, "Notification updated successfully") { Data = noti };
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating notification");
            }
        }
    }
}
