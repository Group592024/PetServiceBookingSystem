

using ChatServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Application.Interfaces
{
    public interface IChatService
    {
        Task<ChatRoom?> GetChatRoomAsync(Guid chatRoomId);
        Task<List<ChatRoom>> GetUserChatRoomsAsync(Guid userId);
        Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId);
        Task SendMessageAsync(Guid chatRoomId, Guid senderId, string message);
        Task<Response> CreateChatRoom(Guid senderId, Guid receiverId);
    }
}
