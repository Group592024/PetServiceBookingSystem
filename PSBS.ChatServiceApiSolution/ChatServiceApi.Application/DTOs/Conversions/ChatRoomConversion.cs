

using ChatServiceApi.Domain.Entities;

namespace ChatServiceApi.Application.DTOs.Conversions
{
    public class ChatRoomConversion
    {
        public static ChatRoom ToEntity(ChatRoomDTO chatRoomDTO) => new()
        {
            ChatRoomId = chatRoomDTO.ChatRoomId,
            ReceiverId = chatRoomDTO.ReceiverId,
            LastMessage = chatRoomDTO.LastMessage,
            IsSeen = chatRoomDTO.IsSeen,
            UpdateAt = chatRoomDTO.UpdateAt,      
        };

       
        public static (ChatRoomDTO?, IEnumerable<ChatRoomDTO>?) FromEntity(ChatRoom chatRoom, IEnumerable<ChatRoom>? chatRooms)
        {
            if (chatRoom is not null || chatRooms is null)
            {
                var singleChatRoom = new ChatRoomDTO(
                    chatRoom!.ChatRoomId,
                    chatRoom.ReceiverId,
                    chatRoom.LastMessage!,
                    chatRoom.UpdateAt,
                    chatRoom.IsSeen
                    );
                return (singleChatRoom, null);
            }
            if (chatRoom is null || chatRooms is not null)
            {
                var list = chatRooms!.Select(p =>
                new ChatRoomDTO(
                   p!.ChatRoomId,
                    p.ReceiverId,
                    p.LastMessage!,
                    p.UpdateAt,
                    p.IsSeen
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
