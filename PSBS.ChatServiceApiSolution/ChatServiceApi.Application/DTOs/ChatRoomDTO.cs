
namespace ChatServiceApi.Application.DTOs
{
    public record ChatRoomDTO
    (
     Guid ChatRoomId ,
     Guid ReceiverId ,
     string LastMessage  ,
     DateTime UpdateAt ,
     bool IsSeen 
        
        );
}
