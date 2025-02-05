using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Domain.Entities;
using Microsoft.AspNetCore.SignalR;
using PSPS.SharedLibrary.PSBSLogs;
using System.Collections.Concurrent;

namespace ChatServiceApi.Presentation.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _connections = new ConcurrentDictionary<string, string>();
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public override Task OnConnectedAsync()
        {
            string userId = Context.GetHttpContext()?.Request.Query["userId"]!;

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("No userId provided.");
            }
            else
            {
                _connections[userId] = Context.ConnectionId; // Safe update using ConcurrentDictionary
                Console.WriteLine($"User {userId} connected with ConnectionId: {Context.ConnectionId}");
            }

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var userId = _connections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;

            if (!string.IsNullOrEmpty(userId))
            {
                _connections.TryRemove(userId, out _); // Safe removal
                Console.WriteLine($"User {userId} disconnected");
            }

            return base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string chatRoomId, string userId, string message)
        {
            try
            {
                Console.WriteLine($"SendMessage invoked: chatRoomId={chatRoomId}, userId={userId}, message={message}");

                if (!Guid.TryParse(chatRoomId, out Guid chatRoomGuid))
                    throw new ArgumentException("Invalid chatRoomId format.", nameof(chatRoomId));

                if (!Guid.TryParse(userId, out Guid userGuid))
                    throw new ArgumentException("Invalid userId format.", nameof(userId));

                await _chatService.SendMessageAsync(chatRoomGuid, userGuid, message);

                await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", userGuid, message);

                var participants = await _chatService.GetChatRoomParticipants(chatRoomGuid);

                if (participants != null && participants.Any())
                {
                    foreach (var participant in participants)
                    {
                        if (_connections.TryGetValue(participant.ToString(), out var connectionId))
                        {
                            LogExceptions.LogToConsole("Participant: " + participant);
                            await Clients.Client(connectionId).SendAsync("GetList",
                                await _chatService.GetUserChatRoomsAsync(participant));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendMessage: {ex.Message}");
                throw;
            }
        }

        public async Task JoinChatRoom(Guid chatRoomId)
        {
            Console.WriteLine($"JoinChatRoom invoked: chatRoomId={chatRoomId}, connectionId={Context.ConnectionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId.ToString());
            await Clients.Caller.SendAsync("JoinedChatRoom", chatRoomId);
        }

        public async Task LeaveChatRoom(Guid chatRoomId)
        {
            Console.WriteLine($"LeaveChatRoom invoked: chatRoomId={chatRoomId}, connectionId={Context.ConnectionId}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoomId.ToString());
            await Clients.Caller.SendAsync("LeftChatRoom", chatRoomId);
        }

        public async Task ChatRoomList(Guid uid)
        {
            try
            {
                await Clients.Caller.SendAsync("GetList", await _chatService.GetUserChatRoomsAsync(uid));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ChatRoomList: {ex.Message}");
                throw;
            }
        }

        public async Task GetChatMessages(Guid chatRoomId, Guid uid)
        {
            try
            {
                await Clients.Caller.SendAsync("UpdateChatMessages", await _chatService.GetChatMessagesAsync(chatRoomId, uid));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in retrieving messages: {ex.Message}");
                throw;
            }
        }

        public async Task CreateChatRoom(Guid senderId, Guid receiverId)
        {
            try
            {
                var response = await _chatService.CreateChatRoom(senderId, receiverId);

                if (response.Flag)
                {
                    var chatRoomId = response.Data.ToString();
                    Console.WriteLine($"Chat room created successfully: {chatRoomId}");

                    await Clients.Caller.SendAsync("ChatRoomCreated", response.Data);
                    await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);

                    var senderChatRooms = await _chatService.GetUserChatRoomsAsync(senderId);
                    var receiverChatRooms = await _chatService.GetUserChatRoomsAsync(receiverId);

                    await Clients.Group(chatRoomId).SendAsync("UpdateAfterCreate", senderChatRooms);
                    await Clients.Group(chatRoomId).SendAsync("UpdateAfterCreate", receiverChatRooms);
                }
                else
                {
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
