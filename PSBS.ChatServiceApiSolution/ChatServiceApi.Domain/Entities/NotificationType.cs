

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ChatServiceApi.Domain.Entities
{
    public class NotificationType
    {
        [Key]
        public Guid NotiTypeId { get; set; }
        public string NotiName { get; set; } = string.Empty;
        [JsonIgnore]
        public virtual ICollection<Notification>? Notifications { get; set; }
    }
}
