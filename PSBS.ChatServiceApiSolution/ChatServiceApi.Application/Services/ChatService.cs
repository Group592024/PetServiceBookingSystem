
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
            var chatRooms = await _chatRepository.GetUserChatRoomsAsync(userId);

            var chatUsers = new List<ChatUserDTO>();

            foreach (var room in chatRooms)
            {
                var participants = await _chatRepository.GetRoomParticipantsAsync(room.ChatRoomId);
                var participant = participants.FirstOrDefault(p => p.UserId == userId);

                if (participant != null)
                {
                    chatUsers.Add(new ChatUserDTO(
                        room.ChatRoomId,
                        participant.ServeFor,
                        participant.UserId,
                        room.LastMessage,
                        room.UpdateAt,
                        participant.IsSeen,
                        room.IsSupportRoom
                    ));
                }
            }

            // Order the chatUsers list *after* it's built
            return chatUsers
                .OrderByDescending(dto => dto.IsSupportRoom)
                .ThenByDescending(dto => dto.UpdateAt)
                .ToList();
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
                CreatedAt = DateTime.Now
            };
            LogExceptions.LogToConsole("e ta oi");
            await _chatRepository.AddChatMessageAsync(chatMessage);
          
        }

        public async Task<Response> CreateChatRoom(Guid senderId, Guid receiverId)
        {
         return  await _chatRepository.CreateChatRoom(senderId, receiverId);

        }

        public async Task<List<Guid>> GetChatRoomParticipants(Guid chatRoomId)
        {
            return await _chatRepository.GetChatRoomParticipantsAsync(chatRoomId);
        }

        public async Task<Response> AssignStaffToChatRoom(Guid chatRoomId, Guid staffId, Guid customerId)
        {
            return await _chatRepository.AssignStaffToChatRoom(chatRoomId, staffId, customerId);
        }

        public async Task<Response> RemoveStaffFromChatRoom(Guid chatRoomId, Guid staffId)
        {
            return await _chatRepository.RemoveStaffFromChatRoom(chatRoomId, staffId);
        }

        public async Task<List<ChatUserDTO>> GetPendingSupportRequestsAsync()
        {
            var pendingChatRooms = await _chatRepository.GetPendingSupportChatRoomsAsync();
            var pendingRequests = new List<ChatUserDTO>();

            foreach (var chatRoom in pendingChatRooms)
            {
                var latestMessage = chatRoom.ChatMessages
                    .OrderByDescending(cm => cm.CreatedAt)
                    .FirstOrDefault();

                if (latestMessage != null)
                {
                    var customerParticipants = await _chatRepository.GetRoomParticipantsAsync(chatRoom.ChatRoomId); // Get the Task<List<>>

                    var customerParticipant = customerParticipants.FirstOrDefault(rp => rp.ChatRoomId == chatRoom.ChatRoomId && !rp.IsSupporter); // Use FirstOrDefault on the List<>, no await

                    if (customerParticipant != null)
                    {
                        var customerRoomParticipants = await _chatRepository.GetRoomParticipantsAsync(chatRoom.ChatRoomId); // Get the Task<List<>>

                        var customerRoomParticipant = customerRoomParticipants.FirstOrDefault(rp => rp.ChatRoomId == chatRoom.ChatRoomId && rp.UserId == customerParticipant.UserId); // Use FirstOrDefault on the List<>, no await

                        if (customerRoomParticipant != null)
                        {
                            pendingRequests.Add(new ChatUserDTO(
                                chatRoom.ChatRoomId,
                                customerParticipant.UserId,
                                customerParticipant.UserId,
                                latestMessage.Text,
                                latestMessage.CreatedAt,
                                customerRoomParticipant.IsSeen,
                                chatRoom.IsSupportRoom
                            ));
                        }
                    }
                }
            }

            return pendingRequests;
        }
        public async Task<Response> InitiateSupportChatRoomAsync(Guid customerId)
        {
            return await _chatRepository.InitiateSupportChatRoomAsync(customerId);
        }

        public async Task<Response> RequestNewSupporter(Guid chatRoomId)
        {
            return await _chatRepository.RequestNewSupporter(chatRoomId);
        }

        public async Task<Response> CheckIfAllSupportersLeftAndUnseen(Guid chatRoomId)
        {
            return await _chatRepository.CheckIfAllSupportersLeftAndUnseen(chatRoomId);
        }
    }
}