

using ChatServiceApi.Domain.Entities;

namespace ChatServiceApi.Application.DTOs.Conversions
{
    public class ChatRoomConversion
    {
        public static ChatRoom ToEntity(ChatRoomDTO chatRoomDTO) => new()
        {
            ChatRoomId = chatRoomDTO.ChatRoomId,
           
            LastMessage = chatRoomDTO.LastMessage,        
            UpdateAt = chatRoomDTO.UpdateAt,      
        };

       
        public static (ChatRoomDTO?, IEnumerable<ChatRoomDTO>?) FromEntity(ChatRoom chatRoom, IEnumerable<ChatRoom>? chatRooms)
        {
            if (chatRoom is not null || chatRooms is null)
            {
                var singleChatRoom = new ChatRoomDTO(
                    chatRoom!.ChatRoomId,
                  
                    chatRoom.LastMessage!,
                    chatRoom.UpdateAt
                 
                    );
                return (singleChatRoom, null);
            }
            if (chatRoom is null || chatRooms is not null)
            {
                var list = chatRooms!.Select(p =>
                new ChatRoomDTO(
                   p!.ChatRoomId,
                 
                    p.LastMessage!,
                    p.UpdateAt      
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
