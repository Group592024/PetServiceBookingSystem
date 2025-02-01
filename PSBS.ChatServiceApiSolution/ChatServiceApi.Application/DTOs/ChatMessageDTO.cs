
namespace ChatServiceApi.Application.DTOs
{
    public record ChatMessageDTO
     (
        Guid ChatMessageId,
     Guid SenderId,
    string Text,
   string? Image,
 DateTime CreatedAt ,
        Guid ChatRoomId

        );
}
