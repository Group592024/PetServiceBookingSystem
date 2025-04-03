using ChatServiceApi.Application.DTOs;
using FakeItEasy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTest.ChatServiceApi.Hubs
{
    public class ConnectionTest : ChatHubTestBase
    {
    
        [Fact]
        public async Task OnDisconnectedAsync_ExistingUser_RemovesFromConnections()
        {
            // Arrange
            var userId = "user_1";
            var connectionId = "conn_123";
            _hub.Connections.TryAdd(userId, connectionId);
            _hub.SetConnectionId(connectionId);

            // Act
            await _hub.OnDisconnectedAsync(null);

            // Assert
            Assert.False(_hub.Connections.ContainsKey(userId));
        }

        [Fact]
        public async Task SendMessage_ValidParameters_StoresAndBroadcasts()
        {
            // Arrange
            var roomId = Guid.NewGuid().ToString();
            var userId = Guid.NewGuid().ToString();
            var message = "Hello";
            var imageUrl = "/uploads/test.jpg";

            A.CallTo(() => _chatService.SendMessageAsync(A<Guid>._, A<Guid>._, message, imageUrl))
                .Returns(Task.CompletedTask);

            // Act
            await _hub.SendMessage(roomId, userId, message, imageUrl);

            // Assert
            A.CallTo(() => _clientProxy.SendCoreAsync("ReceiveMessage",
                A<object[]>.That.Matches(args =>
                    args[1].ToString() == message &&
                    args[3].ToString() == imageUrl),
                default)).MustHaveHappened();
        }

        [Fact]
        public async Task SendMessage_InvalidRoomId_ThrowsException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _hub.SendMessage("invalid", Guid.NewGuid().ToString(), "test", null));
        }

        [Fact]
        public async Task JoinChatRoom_ValidId_AddsToGroup()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            _hub.SetConnectionId("conn_123");

            // Act
            await _hub.JoinChatRoom(roomId);

            // Assert
            A.CallTo(() => _groups.AddToGroupAsync("conn_123", roomId.ToString(), default))
                .MustHaveHappened();
            A.CallTo(() => _singleClientProxy.SendCoreAsync("JoinedChatRoom", A<object[]>.That.Contains(roomId), default))
                .MustHaveHappened();
        }

        [Fact]
        public async Task CreateChatRoom_Success_NotifiesBothUsers()
        {
            // Arrange
            var senderId = Guid.NewGuid();
            var receiverId = Guid.NewGuid();
            var response = new Response(true, "Success") { Data = senderId };

            A.CallTo(() => _chatService.CreateChatRoom(senderId, receiverId)).Returns(response);
            _hub.Connections.TryAdd(senderId.ToString(), "conn_sender");
            _hub.Connections.TryAdd(receiverId.ToString(), "conn_receiver");

            // Act
            await _hub.CreateChatRoom(senderId, receiverId);

            // Assert
            A.CallTo(() => _singleClientProxy.SendCoreAsync("updateaftercreate", A<object[]>._, default))
                .MustHaveHappenedTwiceExactly();
        }

        [Fact]
        public async Task CreateSupportChatRoom_Success_AddsToGroup()
        {
            // Arrange
            var customerId = Guid.NewGuid();
            var response = new Response(true, "Created") { Data = customerId };
            A.CallTo(() => _chatService.InitiateSupportChatRoomAsync(customerId)).Returns(response);

            // Act
            await _hub.CreateSupportChatRoom(customerId);

            // Assert
            A.CallTo(() => _groups.AddToGroupAsync(_hub.Context.ConnectionId, customerId.ToString(), default))
                .MustHaveHappened();
        }

        [Fact]
        public async Task RequestNewSupporter_ValidRequest_NotifiesGroup()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var response = new Response(true, "Success");
            A.CallTo(() => _chatService.RequestNewSupporter(roomId)).Returns(response);

            // Act
            await _hub.RequestNewSupporter(roomId);

            // Assert
            A.CallTo(() => _clientProxy.SendCoreAsync("NewSupporterRequested",
                A<object[]>.That.Matches(args => args[0].ToString() == "A new supporter is being assigned."),
                default)).MustHaveHappened();
        }    

       
    }
}
