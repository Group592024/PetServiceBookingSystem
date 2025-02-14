
namespace ChatServiceApi.Application.DTOs
{
    public record ChatUserDTO
   (
     
    Guid ChatRoomId,
    Guid ServeFor,
    Guid RoomOwner,
    string LastMessage,
    DateTime UpdateAt,
    bool IsSeen,
    bool IsSupportRoom
       );
}
