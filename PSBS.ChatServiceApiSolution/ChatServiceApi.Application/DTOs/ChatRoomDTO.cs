
namespace ChatServiceApi.Application.DTOs
{
    public record ChatRoomDTO
    (
     Guid ChatRoomId ,   
     string LastMessage  ,
     DateTime UpdateAt 
        
        );
}
