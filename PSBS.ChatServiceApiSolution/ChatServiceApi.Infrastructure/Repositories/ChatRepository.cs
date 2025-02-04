

using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using ChatServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;

namespace ChatServiceApi.Infrastructure.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly ChatServiceDBContext _context;

        public ChatRepository(ChatServiceDBContext context)
        {
            _context = context;
        }

        public async Task<ChatRoom?> GetChatRoomByIdAsync(Guid chatRoomId)
        {
            return await _context.ChatRooms
                .Include(cr => cr.ChatMessages)
                .FirstOrDefaultAsync(cr => cr.ChatRoomId == chatRoomId);
        }

        public async Task<List<ChatRoom>> GetUserChatRoomsAsync(Guid userId)
        {
            return await _context.ChatRooms
                .Where(cr => _context.RoomParticipants
                    .Any(rp => rp.ChatRoomId == cr.ChatRoomId && rp.UserId == userId))
                .ToListAsync();
        }

        public async Task AddChatMessageAsync(ChatMessage message)
        {
            await _context.ChatMessages.AddAsync(message);

            var userChat = await _context.ChatRooms.FindAsync(message.ChatRoomId);
            if (userChat != null) // Ensure the chat room exists
            {
                userChat.LastMessage = message.Text;
                userChat.UpdateAt = DateTime.UtcNow; // Use UTC for consistency

                _context.ChatRooms.Update(userChat); // Explicitly mark as updated
            }

            await _context.SaveChangesAsync(); // Save changes to DB
        }


        public async Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId)
        {
            return await _context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Response> CreateChatRoom(Guid senderId, Guid receiverId)
        {
            // Check if a chat room already exists between the sender and receiver
            var existingChatRoom = _context.ChatRooms
                .FirstOrDefault(cr => cr.Participants!.Any(rp => rp.UserId == senderId) &&
                                     cr.Participants!.Any(rp => rp.UserId == receiverId));

            if (existingChatRoom != null)
            {
                return new Response(false, "Chat room already exists");
            }

            // Create a new chat room
            ChatRoom chatRoom = new ChatRoom()
            {
                UpdateAt = DateTime.Now,
                ReceiverId = receiverId,
                LastMessage = "",
                IsSeen = false
            };

            var createdChatRoom = _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // Add participants to the chat room
            var roomParticipant1 = new RoomParticipant
            {
                ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                UserId = senderId
            };

            var roomParticipant2 = new RoomParticipant
            {
                ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                UserId = receiverId
            };

            _context.RoomParticipants.Add(roomParticipant1);
            _context.RoomParticipants.Add(roomParticipant2);
            await _context.SaveChangesAsync();
            LogExceptions.LogToConsole("ua ta vao toi buoc nay r ma");
            // Return success response with the created chat room
            return new Response(true, "Chat room created successfully")
            {
                Data = new
                {
                    ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                    Participants = new List<Guid> { senderId, receiverId }
                }
            };
        }
        public async Task<List<Guid>> GetChatRoomParticipantsAsync(Guid chatRoomId)
        {
            return await _context.RoomParticipants
                .Where(rp => rp.ChatRoomId == chatRoomId)
                .Select(rp => rp.UserId)
                .ToListAsync();
        }

    }
}