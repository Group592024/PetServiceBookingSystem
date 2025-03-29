

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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
        public bool IsDeleted { get; set; }
        public bool IsPushed { get; set; }
        [JsonIgnore]
        public virtual NotificationType NotificationType { get; set; } = null!;
        [JsonIgnore]
        public virtual ICollection<NotificationBox>? NotificationBoxes { get; set; }
    }
}
