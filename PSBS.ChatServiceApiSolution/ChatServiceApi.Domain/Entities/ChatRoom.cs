
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ChatServiceApi.Domain.Entities
{
    public class ChatRoom
    {
        [Key]
        public Guid ChatRoomId { get; set; }    
        public string LastMessage { get; set; } = null!;
        public DateTime UpdateAt { get; set; }
       
        [JsonIgnore]
        public virtual ICollection<ChatMessage>? ChatMessages { get; set; }
        [JsonIgnore]
        public virtual ICollection<RoomParticipant>? Participants { get; set; } 
    }
}
