
using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Responses;
namespace ChatServiceApi.Application.Interfaces
{
    public interface IChatService
    {
        Task<ChatRoom?> GetChatRoomAsync(Guid chatRoomId);
        Task<List<ChatUserDTO>> GetUserChatRoomsAsync(Guid userId);
        Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId, Guid uid);
        Task SendMessageAsync(Guid chatRoomId, Guid senderId, string? message, string? imageData);
        Task<Response> CreateChatRoom(Guid senderId, Guid receiverId);
        Task<List<Guid>> GetChatRoomParticipants(Guid chatRoomId);
        Task<Response> AssignStaffToChatRoom(Guid chatRoomId, Guid staffId, Guid customerId);
        Task<Response> RemoveStaffFromChatRoom(Guid chatRoomId, Guid staffId);
        Task<List<ChatUserDTO>> GetPendingSupportRequestsAsync();
        Task<Response> InitiateSupportChatRoomAsync(Guid customerId);
        Task<Response> RequestNewSupporter(Guid chatRoomId);
        Task<Response> CheckIfAllSupportersLeftAndUnseen(Guid chatRoomId);
    }
}
