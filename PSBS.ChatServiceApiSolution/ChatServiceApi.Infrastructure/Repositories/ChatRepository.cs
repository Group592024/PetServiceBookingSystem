

using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using ChatServiceApi.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
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
                    .Any(rp => rp.ChatRoomId == cr.ChatRoomId && rp.UserId == userId && !rp.IsLeave))
                .OrderByDescending(cr => cr.IsSupportRoom) // Order by IsSupport (true first)
                .ThenByDescending(cr => cr.UpdateAt)    // Then order by UpdateAt (most recent first)
                .ToListAsync();
        }


        public async Task AddChatMessageAsync(ChatMessage message)
        {
            await _context.ChatMessages.AddAsync(message);       
            var userChat = await _context.ChatRooms.FindAsync(message.ChatRoomId);
            if (userChat != null) // Ensure the chat room exists
            {
              if(string.IsNullOrEmpty(message.Text))
                {
                    userChat.LastMessage = "Send an image";
                }
                else
                {
                    userChat.LastMessage = message.Text;
                }
                userChat.UpdateAt = DateTime.Now; // Use UTC for consistency

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
        public async Task<Response> CreateChatRoom(Guid senderId, Guid receiverId)
        {
            // Check if a chat room already exists between the sender and receiver (excluding support rooms)
            var existingChatRoom = await _context.ChatRooms
                .Where(cr => !cr.IsSupportRoom) // Ensure we only check non-support chat rooms
                .FirstOrDefaultAsync(cr => cr.Participants.Any(rp => rp.UserId == senderId) &&
                                           cr.Participants.Any(rp => rp.UserId == receiverId));

            if (existingChatRoom != null)
            {
                return new Response(false, "Chat room already exists");
            }

            // Create a new chat room
            ChatRoom chatRoom = new ChatRoom()
            {
                UpdateAt = DateTime.UtcNow, 
                LastMessage = "Start the chat now!",
            };

            var createdChatRoom = _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // Add participants to the chat room
            var roomParticipant1 = new RoomParticipant
            {
                ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                UserId = senderId,
                ServeFor = receiverId,
                IsSupporter = false
            };

            var roomParticipant2 = new RoomParticipant
            {
                ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                UserId = receiverId,
                ServeFor = senderId,
                IsSupporter = false
            };

            _context.RoomParticipants.Add(roomParticipant1);
            _context.RoomParticipants.Add(roomParticipant2);
            await _context.SaveChangesAsync();

            // Return success response with the created chat room ID
            return new Response(true, "Chat room created successfully")
            {
                Data = new { createdChatRoom.Entity.ChatRoomId }
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

        public async Task<Response> AssignStaffToChatRoom(Guid chatRoomId, Guid staffId, Guid customerId)
        {
            var existingParticipant = await _context.RoomParticipants
                .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == staffId); // Find ANY existing record (even if IsLeave is true)

            if (existingParticipant != null)
            {
                if (!existingParticipant.IsLeave) // If they are already in the room
                {
                    return new Response(false, "Staff is already assigned to this chat room.");
                }
                else // Staff was in the room before but left
                {
                    existingParticipant.IsLeave = false; // Re-activate them
                    _context.RoomParticipants.Update(existingParticipant);
                    await _context.SaveChangesAsync();
                    return new Response(true, "Staff re-assigned successfully.");
                }

            }
            else // No previous record exists
            {
                var newParticipant = new RoomParticipant
                {
                    ChatRoomId = chatRoomId,
                    UserId = staffId, // The staff member's ID
                    ServeFor = customerId, // Staff serves for themselves
                    IsSeen = false,
                    IsLeave = false,
                     IsSupporter = true
                };

                _context.RoomParticipants.Add(newParticipant);
                await _context.SaveChangesAsync();
                return new Response(true, "Staff assigned successfully.");
            }
        }

        public async Task<Response> RemoveStaffFromChatRoom(Guid chatRoomId, Guid staffId)
        {
            var participant = await _context.RoomParticipants
                .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == staffId && !rp.IsLeave);

            if (participant == null)
            {
                return new Response(false, "Staff is not assigned to this chat room.");
            }

            participant.IsLeave = true;
            await _context.SaveChangesAsync();
            return new Response(true, "Staff removed successfully.");
        }


        public async Task<RoomParticipant?> GetStaffInChatRoom(Guid chatRoomId)
        {
            return await _context.RoomParticipants
                .Where(rp => rp.ChatRoomId == chatRoomId && rp.ServeFor != rp.UserId && !rp.IsLeave) // Staff serves for others and is not leave
                .FirstOrDefaultAsync();
        }

        public async Task<List<ChatRoom>> GetPendingSupportChatRoomsAsync()
        {
            return await _context.ChatRooms
                .Where(cr => cr.IsSupportRoom &&
                    (
                        // Condition 1: No supporters in the room, and at least one message from a non-supporter
                        (!_context.RoomParticipants.Any(rp => rp.ChatRoomId == cr.ChatRoomId && rp.IsSupporter) &&
                         _context.ChatMessages.Any(cm => cm.ChatRoomId == cr.ChatRoomId &&
                                                         _context.RoomParticipants.Any(rp => rp.ChatRoomId == cr.ChatRoomId &&
                                                                                             rp.UserId == cm.SenderId &&
                                                                                             !rp.IsSupporter)))

                        // Condition 2: Supporters existed but all have left, and at least one message is unseen
                        || (!_context.RoomParticipants.Any(rp => rp.ChatRoomId == cr.ChatRoomId && rp.IsSupporter && !rp.IsLeave) &&
                            _context.RoomParticipants.Any(rp => rp.ChatRoomId == cr.ChatRoomId && rp.IsSupporter && !rp.IsSeen))
                    )
                )
                .Include(cr => cr.ChatMessages) // Include messages for better performance
                .ToListAsync();
        }

        public async Task<Response> InitiateSupportChatRoomAsync(Guid customerId)
        {
            // Check if the customer already has an active support chat room
            var existingSupportRoom = await _context.ChatRooms
                .FirstOrDefaultAsync(cr =>
                    cr.IsSupportRoom && // It's a support room
                    _context.RoomParticipants.Any(rp =>
                        rp.ChatRoomId == cr.ChatRoomId &&
                        rp.UserId == customerId && // Customer is a participant
                        !rp.IsLeave // Customer hasn't left the room
                    )
                );

            if (existingSupportRoom != null)
            {
                return new Response(false, "You already have an active support chat room.");
            }

            // Create a new support chat room
            var chatRoom = new ChatRoom
            {
                UpdateAt = DateTime.UtcNow,
                LastMessage = "Support chat initiated.",
                IsSupportRoom = true // Mark as a support room
            };

            // Add the chat room to the database
            var createdChatRoom = _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // Add the customer as a participant
            var customerParticipant = new RoomParticipant
            {
                ChatRoomId = createdChatRoom.Entity.ChatRoomId,
                UserId = customerId,
                ServeFor = customerId, // Customer serves for themselves
                IsSeen = false,
                IsLeave = false,
                IsSupporter = false // Customer is not a supporter
            };

            _context.RoomParticipants.Add(customerParticipant);
            await _context.SaveChangesAsync();

            return new Response(true, "Support chat room created successfully.")
            {
                Data = new
                {
                    createdChatRoom.Entity.ChatRoomId
                }
            };
        }
        public async Task<Response> RequestNewSupporter(Guid chatRoomId)
        {
            // Get all supporters in the chat room
            var supporters = await _context.RoomParticipants
                .Where(rp => rp.ChatRoomId == chatRoomId && rp.IsSupporter) // Ensure it's a supporter
                .ToListAsync();

            if (!supporters.Any())
            {
                return new Response(false, "No supporters found in this chat room.");
            }

            // Mark all supporters as leaving and unseen
            foreach (var supporter in supporters)
            {
                supporter.IsLeave = true;
                supporter.IsSeen = false;
            }

            await _context.SaveChangesAsync();

            return new Response(true, "All supporters have been marked as leaving and unseen.");
        }
        public async Task<Response> CheckIfAllSupportersLeftAndUnseen(Guid chatRoomId)
        {
            var allLeftAndUnseen = await _context.RoomParticipants
                .Where(rp => rp.ChatRoomId == chatRoomId && rp.IsSupporter)
                .AllAsync(rp => rp.IsLeave && !rp.IsSeen);

            return new Response(allLeftAndUnseen, allLeftAndUnseen ? "All supporters have left and are unseen." : "There are active supporters.");
        }

        public async Task<Response> StoreImage(IFormFile image, string webRootPath)
        {
            if (image == null || image.Length == 0)
            {
                return new Response(false, "No image file provided.");
            }

            if (webRootPath == null)
            {
                return new Response(false, "WebRootPath is null.");
            }

            try
            {
                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                string filePath = Path.Combine(webRootPath, "uploads", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                string imageUrl = $"/uploads/{fileName}";

                return new Response(true, "Image uploaded successfully.") { Data = imageUrl };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error storing image: {ex.Message}");
                return new Response(false, "Internal server error.");
            }
        }
    }

}