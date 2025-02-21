
using ChatServiceApi.Domain.Entities;

namespace ChatServiceApi.Application.DTOs.Conversions
{
    public class ChatMessageConversion
    {
        public static ChatMessage ToEntity(ChatMessageDTO chatMessageDTO) => new()
        {
            ChatMessageId = chatMessageDTO.ChatMessageId,
            SenderId = chatMessageDTO.SenderId,
            Image = chatMessageDTO.Image,
            CreatedAt = chatMessageDTO.CreatedAt,
            Text = chatMessageDTO.Text,
            ChatRoomId = chatMessageDTO.ChatRoomId
        };


        public static (ChatMessageDTO?, IEnumerable<ChatMessageDTO>?) FromEntity(ChatMessage chatMessage, IEnumerable<ChatMessage>? chatMessages)
        {
            if (chatMessage is not null || chatMessages is null)
            {
                var singlechatMessage = new ChatMessageDTO(
                    chatMessage!.ChatMessageId,
                    chatMessage.SenderId,
                     chatMessage.Text,
                    chatMessage.Image!,
                    chatMessage.CreatedAt,
                    chatMessage.ChatRoomId
                    );
                return (singlechatMessage, null);
            }
            if (chatMessage is null || chatMessages is not null)
            {
                var list = chatMessages!.Select(p =>
                new ChatMessageDTO(
                   p!.ChatMessageId,
                    p.SenderId,
                     p.Text,
                    p.Image!,
                    p.CreatedAt,
                    p.ChatRoomId
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
