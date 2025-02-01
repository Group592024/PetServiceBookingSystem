
using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;

        public ChatService(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        public async Task<ChatRoom?> GetChatRoomAsync(Guid chatRoomId)
        {
            return await _chatRepository.GetChatRoomByIdAsync(chatRoomId);
        }

        public async Task<List<ChatRoom>> GetUserChatRoomsAsync(Guid userId)
        {
            return await _chatRepository.GetUserChatRoomsAsync(userId);
        }

        public async Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId)
        {
            return await _chatRepository.GetChatMessagesAsync(chatRoomId);
        }

        public async Task SendMessageAsync(Guid chatRoomId, Guid senderId, string message)
        {
            var chatMessage = new ChatMessage
            {
                ChatRoomId = chatRoomId,
                SenderId = senderId,
                Text = message,
                CreatedAt = DateTime.UtcNow
            };
            LogExceptions.LogToConsole("e ta oi");
            await _chatRepository.AddChatMessageAsync(chatMessage);
            await _chatRepository.SaveChangesAsync();
        }

        public async Task<Response> CreateChatRoom(Guid senderId, Guid receiverId)
        {
         return  await _chatRepository.CreateChatRoom(senderId, receiverId);

        }
    }
}