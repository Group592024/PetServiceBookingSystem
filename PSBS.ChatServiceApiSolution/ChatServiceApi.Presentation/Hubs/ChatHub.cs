using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using PSPS.SharedLibrary.PSBSLogs;
using System.Collections.Concurrent;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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

        public async Task SendMessage(string chatRoomId, string userId, string message, string? imageUrl)
        {
            try
            {
                Console.WriteLine($"SendMessage invoked: chatRoomId={chatRoomId}, userId={userId}, message={message}");

                if (!Guid.TryParse(chatRoomId, out Guid chatRoomGuid))
                    throw new ArgumentException("Invalid chatRoomId format.", nameof(chatRoomId));

                if (!Guid.TryParse(userId, out Guid userGuid))
                    throw new ArgumentException("Invalid userId format.", nameof(userId));
             
                 await _chatService.SendMessageAsync(chatRoomGuid, userGuid, message, imageUrl);  

                await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", userGuid, message, DateTime.Now, imageUrl);
                await Clients.All.SendAsync("UpdatePendingSupportRequests", await _chatService.GetPendingSupportRequestsAsync());

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
                    var chatRoomId = response.Data!.ToString();
                    Console.WriteLine($"Chat room created successfully: {chatRoomId}");

                    await Clients.Caller.SendAsync("ChatRoomCreated", response.Data);
                    await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId!);

                    var senderChatRooms = await _chatService.GetUserChatRoomsAsync(senderId);
                    var receiverChatRooms = await _chatService.GetUserChatRoomsAsync(receiverId);

                    // Check if sender has an active connection before sending the update
                    if (_connections.TryGetValue(senderId.ToString(), out var senderConnectionId))
                    {
                        await Clients.Client(senderConnectionId).SendAsync("updateaftercreate", senderChatRooms);
                    }

                    // Check if receiver has an active connection before sending the update
                    if (_connections.TryGetValue(receiverId.ToString(), out var receiverConnectionId))
                    {
                        await Clients.Client(receiverConnectionId).SendAsync("updateaftercreate", receiverChatRooms);
                    }

                    LogExceptions.LogToConsole("da tao dc roi ne , PINK PONY CLUB");
                }
                else
                {
                    await Clients.Caller.SendAsync("ChatRoomCreationFailed", response.Message);
                    LogExceptions.LogToConsole("da tao dc roi ne , bIJ LOI NHA BINI B");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateChatRoom: {ex.Message}");
                await Clients.Caller.SendAsync("ChatRoomCreationFailed", "An error occurred while creating the chat room.");
                LogExceptions.LogToConsole("hong tao dc ne");
            }
        }

        public async Task AssignStaffToChatRoom(Guid chatRoomId, Guid staffId, Guid customerId)
        {
            try
            {
                var response = await _chatService.AssignStaffToChatRoom(chatRoomId, staffId, customerId );
                if (response.Flag)
                {
                    await Clients.Caller.SendAsync("StaffAssigned", chatRoomId, staffId);
                    await Clients.Caller.SendAsync("GetList",
                               await _chatService.GetUserChatRoomsAsync(staffId));

                }
                else
                {
                    await Clients.Caller.SendAsync("AssignStaffFailed", response.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AssignStaffToChatRoom: {ex.Message}");
                await Clients.Caller.SendAsync("AssignStaffFailed", "An error occurred while assigning staff.");
            }
        }

        public async Task RemoveStaffFromChatRoom(Guid chatRoomId, Guid staffId)
        {
            try
            {
                var response = await _chatService.RemoveStaffFromChatRoom(chatRoomId, staffId);
                if (response.Flag)
                {
                    await Clients.Caller.SendAsync("StaffRemoved", chatRoomId, staffId); // Notify everyone
                    await Clients.Caller.SendAsync("GetList", await _chatService.GetUserChatRoomsAsync(staffId));

                }
                else
                {
                    await Clients.Caller.SendAsync("RemoveStaffFailed", response.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in RemoveStaffFromChatRoom: {ex.Message}");
                await Clients.Caller.SendAsync("RemoveStaffFailed", "An error occurred while removing staff.");
            }
        }

        public async Task<List<ChatUserDTO>> GetPendingSupportRequests()
        {
            return await _chatService.GetPendingSupportRequestsAsync(); // Call the service method
        }

        public async Task CreateSupportChatRoom(Guid customerId)
        {
            try
            {
                var response = await _chatService.InitiateSupportChatRoomAsync(customerId);

                if (response.Flag)
                {
                    var chatRoomId = response.Data!.ToString();
                    await Clients.Caller.SendAsync("SupportChatRoomCreated", chatRoomId); // Notify the caller
                    await Clients.Caller.SendAsync("GetList", await _chatService.GetUserChatRoomsAsync(customerId));
                    // Add the caller to the chat room group
                    await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId!.ToString());

                 

                }
                else
                {
                    await Clients.Caller.SendAsync("SupportChatRoomCreationFailed", response.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateSupportChatRoom: {ex.Message}");
                await Clients.Caller.SendAsync("SupportChatRoomCreationFailed", "An error occurred while creating the support chat room.");
            }
        }

        public async Task RequestNewSupporter(Guid chatRoomId)
        {
            try
            {
                var checkResponse = await _chatService.CheckIfAllSupportersLeftAndUnseen(chatRoomId);

                if (checkResponse.Flag)
                {
                    await Clients.Caller.SendAsync("RequestNewSupporterFailed", "Please be patient, a new supporter is being assigned.");
                    return;
                }

                var response = await _chatService.RequestNewSupporter(chatRoomId);

                if (response.Flag)
                {
                    // Notify the customer that a new supporter is being assigned
                    await Clients.Group(chatRoomId.ToString()).SendAsync("NewSupporterRequested", "A new supporter is being assigned.");

                    var participants = await _chatService.GetChatRoomParticipants(chatRoomId);

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

                    await Clients.All.SendAsync("UpdatePendingSupportRequests", await _chatService.GetPendingSupportRequestsAsync());
                }
                else
                {
                    await Clients.Caller.SendAsync("RequestNewSupporterFailed", response.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in RequestNewSupporter: {ex.Message}");
                await Clients.Caller.SendAsync("RequestNewSupporterFailed", "An error occurred while requesting a new supporter.");
            }
        }


    }
}
