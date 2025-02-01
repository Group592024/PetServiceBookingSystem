using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace ChatServiceApi.Presentation.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }
        // When a client sends a message, broadcast it to the specific chat room
        public async Task SendMessage(string chatRoomId, string userId, string message)
        {
            try
            {
                Console.WriteLine($"SendMessage invoked: chatRoomId={chatRoomId}, userId={userId}, message={message}");
                await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", userId, message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendMessage: {ex.Message}");
                throw;
            }
        }


        // Add the current connection to a chat room
        public async Task JoinChatRoom(Guid chatRoomId)
        {
            Console.WriteLine($"JoinChatRoom invoked: chatRoomId={chatRoomId}, connectionId={Context.ConnectionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId.ToString());

            // Notify the client they successfully joined
            await Clients.Caller.SendAsync("JoinedChatRoom", chatRoomId);
        }

        // Remove the current connection from a chat room
        public async Task LeaveChatRoom(Guid chatRoomId)
        {
            Console.WriteLine($"LeaveChatRoom invoked: chatRoomId={chatRoomId}, connectionId={Context.ConnectionId}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoomId.ToString());

            // Notify the client they successfully left
            await Clients.Caller.SendAsync("LeftChatRoom", chatRoomId);
        }

        public async Task ChatRoomList(Guid uid)
        {
          
            try
            {              
                await Clients.Caller.SendAsync("UpdateChatList", await _chatService.GetUserChatRoomsAsync(uid));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendMessage: {ex.Message}");
                throw;
            }
        }


        // Method to create a chat room
        public async Task CreateChatRoom(Guid senderId, Guid receiverId)
        {
            try
            {
                var response = await _chatService.CreateChatRoom(senderId, receiverId);

                if (response.Flag)
                {
                    // Notify the caller that the chat room was created successfully
                    await Clients.Caller.SendAsync("ChatRoomCreated", response.Data);

                    // Notify both users to refresh their chat list
                    await Clients.User(senderId.ToString()).SendAsync("UpdateChatList", await _chatService.GetUserChatRoomsAsync(receiverId));
                    await Clients.User(receiverId.ToString()).SendAsync("UpdateChatList", await _chatService.GetUserChatRoomsAsync(senderId));

                }
                else
                {
                    // Notify the caller that the chat room creation failed
                    await Clients.Caller.SendAsync("ChatRoomCreationFailed", response.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateChatRoom: {ex.Message}");
                await Clients.Caller.SendAsync("ChatRoomCreationFailed", "An error occurred while creating the chat room.");
            }
        }


    }
}
