
using ChatServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Application.Interfaces
{
    public interface IChatRepository
    {
        Task<ChatRoom?> GetChatRoomByIdAsync(Guid chatRoomId);
        Task<List<ChatRoom>> GetUserChatRoomsAsync(Guid userId);
        Task AddChatMessageAsync(ChatMessage message);
        Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId);
        Task SaveChangesAsync();
        Task<Response> CreateChatRoom(Guid SenderId, Guid ReceiverId);
        Task<List<Guid>> GetChatRoomParticipantsAsync(Guid chatRoomId);
    }
}
