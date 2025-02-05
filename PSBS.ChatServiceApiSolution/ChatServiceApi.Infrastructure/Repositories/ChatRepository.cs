

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
                .OrderByDescending(m => m.UpdateAt) // Sorting in descending order
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

            // Fetch all participants in the chat room
            var participants = await _context.RoomParticipants
                .Where(p => p.ChatRoomId == message.ChatRoomId)
                .ToListAsync();

            foreach (var participant in participants)
            {
                if (participant.UserId == message.SenderId)
                {
                    participant.IsSeen = true; // Sender sees their own message
                }
                else
                {
                    participant.IsSeen = false; // Other participants haven't seen it yet
                }

                _context.RoomParticipants.Update(participant);
            }

            await _context.SaveChangesAsync(); // Save all changes to DB
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
              
                LastMessage = "",
               
            };

            var createdChatRoom = _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // Add participants to the chat room
            var roomParticipant1 = new RoomParticipant
            {
                ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                UserId = senderId,
                ServeFor = receiverId,
            };

            var roomParticipant2 = new RoomParticipant
            {
                ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                UserId = receiverId,
                ServeFor = senderId,
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
                   createdChatRoom.Entity.ChatRoomId                  
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

        public async Task<List<RoomParticipant>> GetRoomParticipantsAsync(Guid chatRoomId)
        {
            return await _context.RoomParticipants
           .Where(p => p.ChatRoomId == chatRoomId)
           .ToListAsync();
        }

        public async Task UpdateIsSeenAsync(Guid chatRoomId, Guid userId)
        {
            // Find the participant record for the user in the chat room
            var participant = await _context.RoomParticipants
                .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == userId);

            if (participant != null)
            {
                // Update the IsSeen flag to true
                participant.IsSeen = true;

                // Save changes to the database
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("User is not a participant of this chat room.");
            }
        }
    }
}