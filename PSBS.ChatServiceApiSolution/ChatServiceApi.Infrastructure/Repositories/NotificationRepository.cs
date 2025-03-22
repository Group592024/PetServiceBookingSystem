
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

        public async Task<Response> CreateNotification(Notification notification, List<Guid> guids)
        {
            try
            {
                var currentNotification = context.Notifications.Add(notification).Entity;
                foreach (var guid in guids) {
                    var notiBox = new NotificationBox {
                        NotificationId = currentNotification.NotificationId,
                        UserId = guid,
                        IsDeleted = false,
                    };
                   context.NotificationBoxes.Add(notiBox);
                }

                await context.SaveChangesAsync();
                if (currentNotification is not null)
                {
                    return new Response(true, $"the notification added to database successfully");
                }
                else
                {
                    return new Response(true, $"the notification cannot be added due to errors");
                }
            }
          
             
            catch (Exception ex){
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured adding new notification");
            }
        }

        public async Task<Response> DetelteNotification( Guid NotificationBoxId)
        {
            try
            {
                var notification = await context.NotificationBoxes.FindAsync(NotificationBoxId);
                if(notification is null)
                {
                    return new Response(false, $"the notification does not exist");
                }
                notification.IsDeleted = true;
                context.Update(notification);
                await context.SaveChangesAsync();
                return new Response(true, $"the notification is updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured updating the notification");
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
            .Where(nb => nb.UserId == userId)
            .OrderByDescending(nb => nb.Notification.CreatedDate)
            .ToListAsync();
        }
    }
}
