

namespace ChatServiceApi.Domain.Entities
{
    public class ChatMessage
    {
        public Guid ChatMessageId { get; set; }
        public Guid SenderId { get; set; }
        public string? Text { get; set; }
        public string? Image {  get; set; }
        public DateTime CreatedAt { get; set; }

        public Guid ChatRoomId { get; set; }
        public virtual ChatRoom ChatRoom { get; set; } = null!;

    }
}
