

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ChatServiceApi.Domain.Entities
{
    public class NotificationBox
    {
        [Key]
        public Guid NotiBoxId { get; set; }
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
        public bool IsDeleted { get; set; }
        [JsonIgnore]
        public virtual Notification Notification { get; set; } = null!;
    }
}
