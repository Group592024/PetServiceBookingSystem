

using ChatServiceApi.Domain.Entities;

namespace ChatServiceApi.Application.DTOs.Conversions
{
    public class NotificationConversion
    {
        public static Notification ToEntity(CreateNotificationDTO createNotiDTO) => new()
        {           
            NotificationTitle = createNotiDTO.NotificationTitle,
            NotificationContent = createNotiDTO.NotificationContent,
            NotiTypeId = createNotiDTO.NotiTypeId,
            CreatedDate = DateTime.Now,
            IsDeleted = false
        };
        public static Notification UpdateToEntity(UpdateNotificationDTO createNotiDTO) => new()
        {
            NotificationId = createNotiDTO.notificationId,
            NotificationTitle = createNotiDTO.NotificationTitle,
            NotificationContent = createNotiDTO.NotificationContent,
            NotiTypeId = createNotiDTO.NotiTypeId,
            CreatedDate = DateTime.Now,
            IsDeleted = createNotiDTO.IsDeleted
        };

        public static (NotificationDTO?, IEnumerable<NotificationDTO>?) FromEntity(Notification notification,
            IEnumerable<Notification>? notifications)
        {
            if (notification is not null || notifications is null)
            {
                var singleNotification = new NotificationDTO(
                  notification!.NotificationId,
                  notification.NotificationType.NotiName,
                  notification.NotificationTitle,
                  notification.NotificationContent,
                  notification.CreatedDate,
                  notification.IsDeleted,
                  notification.IsPushed
                    );
                return (singleNotification, null);
            }
            if (notification is null || notifications is not null)
            {
                var list = notifications!.Select(p =>
                new NotificationDTO(
                   p!.NotificationId,
                  p.NotificationType.NotiName,
                  p.NotificationTitle,
                  p.NotificationContent,
                  p.CreatedDate,
                  p.IsDeleted,
                  p.IsPushed
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }

        public static (UserNotificationDTO?, IEnumerable<UserNotificationDTO>?) FromEntityToUserNoti(NotificationBox notificationBox,
           IEnumerable<NotificationBox>? notificationBoxes)
        {
            if (notificationBox is not null || notificationBoxes is null)
            {
                var singleNotification = new UserNotificationDTO(
                  notificationBox!.NotiBoxId,
                  notificationBox.UserId,
                  notificationBox.Notification.NotificationType.NotiName,
                  notificationBox.Notification.NotificationTitle,
                  notificationBox.Notification.NotificationContent,
                  notificationBox.Notification.CreatedDate,
                  notificationBox.IsDeleted
                    );
                return (singleNotification, null);
            }
            if (notificationBox is null || notificationBoxes is not null)
            {
                var list = notificationBoxes!.Select(p =>
                new UserNotificationDTO(
                  p!.NotiBoxId,
                  p.UserId,
                  p.Notification.NotificationType.NotiName,
                  p.Notification.NotificationTitle,
                  p.Notification.NotificationContent,
                  p.Notification.CreatedDate,
                  p.IsDeleted
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }

        public static List<Guid> GetUserIdsFromReceivers(List<ReceiverDTO> receivers)
        {
            if (receivers == null || !receivers.Any())
            {
                return new List<Guid>(); // Return an empty list if receivers is null or empty
            }

            return receivers.Select(r => r.UserId).ToList();
        }

    }
}
