
using System.ComponentModel.DataAnnotations;

namespace ChatServiceApi.Domain.Entities
{
    public class RoomParticipant
    {
        [Key]
        public Guid RoomParticipantId { get; set; }

        [Required]
        public Guid ChatRoomId { get; set; }

        [Required]
        public Guid UserId { get; set; }
        public Guid ServeFor { get; set; }

        public bool IsSeen { get; set; }
        public bool IsLeave { get; set; }
        public bool IsSupporter { get; set; } = false;
        public virtual ChatRoom? ChatRoom { get; set; }
    }
}
