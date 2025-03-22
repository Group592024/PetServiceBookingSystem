

using System.ComponentModel.DataAnnotations;

namespace ChatServiceApi.Domain.Entities
{
    public class Notification
    {
        [Key]
        public Guid NotificationId { get; set; }
        public Guid NotiTypeId { get; set; }   
        public string NotificationTitle { get; set; } = string.Empty;
        public string NotificationContent { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

        public virtual NotificationType NotificationType { get; set; } = null!;

        public virtual ICollection<NotificationBox>? NotificationBoxes { get; set; }
    }
}
