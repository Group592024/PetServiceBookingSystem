
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

        public virtual ChatRoom ChatRoom { get; set; }
    }
}
