
using ChatServiceApi.Domain.Entities;
using Microsoft.AspNetCore.Http;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Application.Interfaces
{
    public interface IChatRepository
    {
        Task<ChatRoom?> GetChatRoomByIdAsync(Guid chatRoomId);
        Task<List<ChatRoom>> GetUserChatRoomsAsync(Guid userId);
        Task AddChatMessageAsync(ChatMessage message);
        Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId);
      
        Task<Response> CreateChatRoom(Guid SenderId, Guid ReceiverId);
        Task<List<Guid>> GetChatRoomParticipantsAsync(Guid chatRoomId);
        Task<List<RoomParticipant>> GetRoomParticipantsAsync(Guid chatRoomId);
        Task UpdateIsSeenAsync(Guid chatRoomId, Guid userId);
        Task<Response> AssignStaffToChatRoom(Guid chatRoomId, Guid staffId, Guid customerId);
        Task<Response> RemoveStaffFromChatRoom(Guid chatRoomId, Guid staffId);
        Task<List<ChatRoom>> GetPendingSupportChatRoomsAsync();
        Task<Response> InitiateSupportChatRoomAsync(Guid customerId);
        Task<Response> RequestNewSupporter(Guid chatRoomId);
        Task<Response> CheckIfAllSupportersLeftAndUnseen(Guid chatRoomId);
        Task<Response> StoreImage(IFormFile image, string webRootPath);
        Task<int> CountUnreadChatsAsync(Guid userId);
    }
}
