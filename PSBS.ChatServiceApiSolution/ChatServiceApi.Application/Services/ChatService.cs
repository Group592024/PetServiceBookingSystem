
using ChatServiceApi.Application.DTOs;
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

        public async Task<List<ChatUserDTO>> GetUserChatRoomsAsync(Guid userId)
        {
            // Get all chat rooms where the user is a participant
            var chatRooms = await _chatRepository.GetUserChatRoomsAsync(userId);

            var chatUsers = new List<ChatUserDTO>();

            foreach (var room in chatRooms)
            {
                // Fetch participants of the room
                var participants = await _chatRepository.GetRoomParticipantsAsync(room.ChatRoomId);

                // Get the participant that matches the given userId
                var participant = participants.FirstOrDefault(p => p.UserId == userId);

                if (participant != null)
                {
                    chatUsers.Add(new ChatUserDTO(
                        room.ChatRoomId,
                        participant.ServeFor,
                        participant.UserId,  // RoomOwner is the user's ID
                        room.LastMessage,
                        room.UpdateAt,
                        participant.IsSeen
                    ));
                }
            }

            return chatUsers;
        }


        public async Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId, Guid uid)
        {
            await _chatRepository.UpdateIsSeenAsync(chatRoomId, uid);
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

        public async Task<List<Guid>> GetChatRoomParticipants(Guid chatRoomId)
        {
            return await _chatRepository.GetChatRoomParticipantsAsync(chatRoomId);
        }
    }
}