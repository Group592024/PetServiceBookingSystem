

using ChatServiceApi.Domain.Entities;
using ChatServiceApi.Infrastructure.Data;
using ChatServiceApi.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace UnitTest.ChatServiceApi.Repositories
{
    public class ChatRepositoryTest
    {

        private readonly ChatServiceDBContext chatServiceDBContext;
        private readonly ChatRepository chatRepository;
        public ChatRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ChatServiceDBContext>()
                .UseInMemoryDatabase(databaseName: "ChatService").Options;

            chatServiceDBContext = new ChatServiceDBContext(options);
            chatRepository = new ChatRepository(chatServiceDBContext);

        }

        [Fact]
        public async Task GetChatRoomByIdAsync_ReturnsChatRoomWithMessages()
        {
            var chatRoomId = Guid.NewGuid();
            var messageId = Guid.NewGuid();
            var chatRoom = new ChatRoom { ChatRoomId = chatRoomId, IsSupportRoom = false, UpdateAt = DateTime.UtcNow, LastMessage = "Test" };
            var message = new ChatMessage { ChatMessageId = messageId, ChatRoomId = chatRoomId, SenderId = Guid.NewGuid(), Text = "Hello", CreatedAt = DateTime.UtcNow };

            chatServiceDBContext.ChatRooms.Add(chatRoom);
            chatServiceDBContext.ChatMessages.Add(message);
            await chatServiceDBContext.SaveChangesAsync();

            var result = await chatRepository.GetChatRoomByIdAsync(chatRoomId);

            result.Should().NotBeNull();
            result.ChatRoomId.Should().Be(chatRoomId);
            result.ChatMessages.Should().Contain(m => m.ChatMessageId == messageId);
        }

        [Fact]
        public async Task GetUserChatRoomsAsync_ReturnsUserChatRoomsOrdered()
        {
            var userId = Guid.NewGuid();
            var chatRoom1 = new ChatRoom { ChatRoomId = Guid.NewGuid(), IsSupportRoom = false, UpdateAt = DateTime.UtcNow.AddDays(-1), LastMessage = "Test" };
            var chatRoom2 = new ChatRoom { ChatRoomId = Guid.NewGuid(), IsSupportRoom = true, UpdateAt = DateTime.UtcNow, LastMessage = "Support" };
            var participant1 = new RoomParticipant { ChatRoomId = chatRoom1.ChatRoomId, UserId = userId, ServeFor = Guid.NewGuid(), IsLeave = false };
            var participant2 = new RoomParticipant { ChatRoomId = chatRoom2.ChatRoomId, UserId = userId, ServeFor = Guid.NewGuid(), IsLeave = false };

            chatServiceDBContext.ChatRooms.AddRange(chatRoom1, chatRoom2);
            chatServiceDBContext.RoomParticipants.AddRange(participant1, participant2);
            await chatServiceDBContext.SaveChangesAsync();

            var result = await chatRepository.GetUserChatRoomsAsync(userId);

            result.Should().NotBeNull();
            result.Should().BeInDescendingOrder(cr => cr.IsSupportRoom);
            result.Should().BeInDescendingOrder(cr => cr.UpdateAt);
        }

        [Fact]
        public async Task AddChatMessageAsync_AddsMessageAndUpdatesChatRoom()
        {
            var chatRoomId = Guid.NewGuid();
            var senderId = Guid.NewGuid();
            var chatRoom = new ChatRoom { ChatRoomId = chatRoomId, IsSupportRoom = false, UpdateAt = DateTime.UtcNow.AddDays(-1), LastMessage = "Old Message" };
            var message = new ChatMessage { ChatMessageId = Guid.NewGuid(), ChatRoomId = chatRoomId, SenderId = senderId, Text = "New Message", CreatedAt = DateTime.UtcNow };
            var participant = new RoomParticipant { ChatRoomId = chatRoomId, UserId = senderId, ServeFor = Guid.NewGuid(), IsLeave = false };

            chatServiceDBContext.ChatRooms.Add(chatRoom);
            chatServiceDBContext.RoomParticipants.Add(participant);
            await chatServiceDBContext.SaveChangesAsync();

            await chatRepository.AddChatMessageAsync(message);

            var addedMessage = await chatServiceDBContext.ChatMessages.FindAsync(message.ChatMessageId);
            var updatedChatRoom = await chatServiceDBContext.ChatRooms.FindAsync(chatRoomId);

            addedMessage.Should().NotBeNull();
            updatedChatRoom.LastMessage.Should().Be("New Message");
            
        }

        [Fact]
        public async Task GetChatMessagesAsync_ReturnsMessagesOrderedByCreation()
        {
            var chatRoomId = Guid.NewGuid();
            var message1 = new ChatMessage { ChatMessageId = Guid.NewGuid(), ChatRoomId = chatRoomId, SenderId = Guid.NewGuid(), Text = "First", CreatedAt = DateTime.UtcNow.AddMinutes(-1) };
            var message2 = new ChatMessage { ChatMessageId = Guid.NewGuid(), ChatRoomId = chatRoomId, SenderId = Guid.NewGuid(), Text = "Second", CreatedAt = DateTime.UtcNow };

            chatServiceDBContext.ChatMessages.AddRange(message1, message2);
            await chatServiceDBContext.SaveChangesAsync();

            var result = await chatRepository.GetChatMessagesAsync(chatRoomId);

            result.Should().NotBeNull();
            result.Should().BeInAscendingOrder(m => m.CreatedAt);
        }

        [Fact]
        public async Task CreateChatRoom_CreatesNewChatRoomAndParticipants()
        {
            var senderId = Guid.NewGuid();
            var receiverId = Guid.NewGuid();

            var response = await chatRepository.CreateChatRoom(senderId, receiverId);

            response.Flag.Should().BeTrue();
            var createdChatRoomId = (Guid)response.Data.GetType().GetProperty("ChatRoomId").GetValue(response.Data);
            var createdChatRoom = await chatServiceDBContext.ChatRooms.FindAsync(createdChatRoomId);
            var participants = await chatServiceDBContext.RoomParticipants.Where(rp => rp.ChatRoomId == createdChatRoomId).ToListAsync();

            createdChatRoom.Should().NotBeNull();
            participants.Should().HaveCount(2);
            participants.Should().Contain(p => p.UserId == senderId);
            participants.Should().Contain(p => p.UserId == receiverId);
        }
        [Fact]
        public async Task GetChatRoomParticipantsAsync_ReturnsListOfUserIds()
        {
            var chatRoomId = Guid.NewGuid();
            var participant1 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), ServeFor = Guid.NewGuid(), IsLeave = false };
            var participant2 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), ServeFor = Guid.NewGuid(), IsLeave = false };

            chatServiceDBContext.RoomParticipants.AddRange(participant1, participant2);
            await chatServiceDBContext.SaveChangesAsync();

            var result = await chatRepository.GetChatRoomParticipantsAsync(chatRoomId);

            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(participant1.UserId);
            result.Should().Contain(participant2.UserId);
        }

        [Fact]
        public async Task GetRoomParticipantsAsync_ReturnsListOfRoomParticipants()
        {
            var chatRoomId = Guid.NewGuid();
            var participant1 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), ServeFor = Guid.NewGuid(), IsLeave = false };
            var participant2 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), ServeFor = Guid.NewGuid(), IsLeave = false };

            chatServiceDBContext.RoomParticipants.AddRange(participant1, participant2);
            await chatServiceDBContext.SaveChangesAsync();

            var result = await chatRepository.GetRoomParticipantsAsync(chatRoomId);

            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(participant1);
            result.Should().Contain(participant2);
        }

        [Fact]
        public async Task UpdateIsSeenAsync_UpdatesParticipantIsSeen()
        {
            var chatRoomId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var participant = new RoomParticipant { ChatRoomId = chatRoomId, UserId = userId, ServeFor = Guid.NewGuid(), IsLeave = false, IsSeen = false };

            chatServiceDBContext.RoomParticipants.Add(participant);
            await chatServiceDBContext.SaveChangesAsync();

            await chatRepository.UpdateIsSeenAsync(chatRoomId, userId);

            var updatedParticipant = await chatServiceDBContext.RoomParticipants
                 .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == userId);
            updatedParticipant.Should().NotBeNull();
            updatedParticipant.IsSeen.Should().BeTrue();
        }

        [Fact]
        public async Task AssignStaffToChatRoom_AssignsNewStaff()
        {
            var chatRoomId = Guid.NewGuid();
            var staffId = Guid.NewGuid();
            var customerId = Guid.NewGuid();

            var response = await chatRepository.AssignStaffToChatRoom(chatRoomId, staffId, customerId);

            response.Flag.Should().BeTrue();
            var participant = await chatServiceDBContext.RoomParticipants.FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == staffId);
            participant.Should().NotBeNull();
            participant.IsSupporter.Should().BeTrue();
        }

        [Fact]
        public async Task AssignStaffToChatRoom_ReassignsStaff()
        {
            var chatRoomId = Guid.NewGuid();
            var staffId = Guid.NewGuid();
            var customerId = Guid.NewGuid();
            var participant = new RoomParticipant { ChatRoomId = chatRoomId, UserId = staffId, ServeFor = customerId, IsLeave = true, IsSupporter = true };

            chatServiceDBContext.RoomParticipants.Add(participant);
            await chatServiceDBContext.SaveChangesAsync();

            var response = await chatRepository.AssignStaffToChatRoom(chatRoomId, staffId, customerId);

            response.Flag.Should().BeTrue();
            var updatedParticipant = await chatServiceDBContext.RoomParticipants
                 .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == staffId);
            updatedParticipant.Should().NotBeNull();
            updatedParticipant.IsLeave.Should().BeFalse();
        }

        [Fact]
        public async Task RemoveStaffFromChatRoom_RemovesStaff()
        {
            var chatRoomId = Guid.NewGuid();
            var staffId = Guid.NewGuid();
            var customerId = Guid.NewGuid();
            var participant = new RoomParticipant { ChatRoomId = chatRoomId, UserId = staffId, ServeFor = customerId, IsLeave = false, IsSupporter = true };

            chatServiceDBContext.RoomParticipants.Add(participant);
            await chatServiceDBContext.SaveChangesAsync();

            var response = await chatRepository.RemoveStaffFromChatRoom(chatRoomId, staffId);

            response.Flag.Should().BeTrue();
            var removedParticipant = await chatServiceDBContext.RoomParticipants
                 .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == staffId);
            removedParticipant.Should().NotBeNull();
            removedParticipant.IsLeave.Should().BeTrue();
        }

        [Fact]
        public async Task GetStaffInChatRoom_ReturnsStaff()
        {
            var chatRoomId = Guid.NewGuid();
            var staffId = Guid.NewGuid();
            var customerId = Guid.NewGuid();
            var participant = new RoomParticipant { ChatRoomId = chatRoomId, UserId = staffId, ServeFor = customerId, IsLeave = false, IsSupporter = true };

            chatServiceDBContext.RoomParticipants.Add(participant);
            await chatServiceDBContext.SaveChangesAsync();

            var result = await chatRepository.GetStaffInChatRoom(chatRoomId);

            result.Should().NotBeNull();
            result.UserId.Should().Be(staffId);
        }

        [Fact]
        public async Task GetPendingSupportChatRoomsAsync_ReturnsPendingSupportRooms()
        {
            var supportRoom1 = new ChatRoom { ChatRoomId = Guid.NewGuid(), IsSupportRoom = true, UpdateAt = DateTime.UtcNow };
            var supportRoom2 = new ChatRoom { ChatRoomId = Guid.NewGuid(), IsSupportRoom = true, UpdateAt = DateTime.UtcNow };
            var nonSupportRoom = new ChatRoom { ChatRoomId = Guid.NewGuid(), IsSupportRoom = false, UpdateAt = DateTime.UtcNow };

            var customer1 = new RoomParticipant { ChatRoomId = supportRoom1.ChatRoomId, UserId = Guid.NewGuid(), IsSupporter = false, IsLeave = false };
            var customer2 = new RoomParticipant { ChatRoomId = supportRoom2.ChatRoomId, UserId = Guid.NewGuid(), IsSupporter = false, IsLeave = false };
            var staff1 = new RoomParticipant { ChatRoomId = supportRoom2.ChatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = true, IsSeen = false };
            var staff2 = new RoomParticipant { ChatRoomId = supportRoom2.ChatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = true, IsSeen = false };
            var customer3 = new RoomParticipant { ChatRoomId = nonSupportRoom.ChatRoomId, UserId = Guid.NewGuid(), IsSupporter = false, IsLeave = false };

            var message1 = new ChatMessage { ChatRoomId = supportRoom1.ChatRoomId, SenderId = customer1.UserId };
            var message2 = new ChatMessage { ChatRoomId = supportRoom2.ChatRoomId, SenderId = customer2.UserId };

            chatServiceDBContext.ChatRooms.AddRange(supportRoom1, supportRoom2, nonSupportRoom);
            chatServiceDBContext.RoomParticipants.AddRange(customer1, customer2, staff1, staff2, customer3);
            chatServiceDBContext.ChatMessages.AddRange(message1, message2);
            await chatServiceDBContext.SaveChangesAsync();

            var pendingRooms = await chatRepository.GetPendingSupportChatRoomsAsync();

            pendingRooms.Should().NotBeNull();
            pendingRooms.Should().Contain(supportRoom1);
            pendingRooms.Should().Contain(supportRoom2);
            pendingRooms.Should().NotContain(nonSupportRoom);
        }

        [Fact]
        public async Task InitiateSupportChatRoomAsync_CreatesNewSupportRoom()
        {
            var customerId = Guid.NewGuid();

            var response = await chatRepository.InitiateSupportChatRoomAsync(customerId);

            response.Flag.Should().BeTrue();
            var createdChatRoomId = (Guid)response.Data.GetType().GetProperty("ChatRoomId").GetValue(response.Data);
            var createdChatRoom = await chatServiceDBContext.ChatRooms.FindAsync(createdChatRoomId);
            createdChatRoom.Should().NotBeNull();
            createdChatRoom.IsSupportRoom.Should().BeTrue();
            var participant = await chatServiceDBContext.RoomParticipants.FirstOrDefaultAsync(rp => rp.ChatRoomId == createdChatRoomId && rp.UserId == customerId);
            participant.Should().NotBeNull();
            participant.IsSupporter.Should().BeFalse();
        }

        [Fact]
        public async Task InitiateSupportChatRoomAsync_ReturnsFalseIfRoomExists()
        {
            var customerId = Guid.NewGuid();
            var chatRoom = new ChatRoom { ChatRoomId = Guid.NewGuid(), IsSupportRoom = true };
            var participant = new RoomParticipant { ChatRoomId = chatRoom.ChatRoomId, UserId = customerId, IsLeave = false };

            chatServiceDBContext.ChatRooms.Add(chatRoom);
            chatServiceDBContext.RoomParticipants.Add(participant);
            await chatServiceDBContext.SaveChangesAsync();

            var response = await chatRepository.InitiateSupportChatRoomAsync(customerId);

            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task RequestNewSupporter_MarksSupportersAsLeftAndUnseen()
        {
            var chatRoomId = Guid.NewGuid();
            var supporter1 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = false, IsSeen = true };
            var supporter2 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = false, IsSeen = true };

            chatServiceDBContext.RoomParticipants.AddRange(supporter1, supporter2);
            await chatServiceDBContext.SaveChangesAsync();

            var response = await chatRepository.RequestNewSupporter(chatRoomId);

            response.Flag.Should().BeTrue();
            var updatedSupporter1 = await chatServiceDBContext.RoomParticipants
                 .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == supporter1.UserId);
            var updatedSupporter2 = await chatServiceDBContext.RoomParticipants
                 .FirstOrDefaultAsync(rp => rp.ChatRoomId == chatRoomId && rp.UserId == supporter2.UserId);
            updatedSupporter1.IsLeave.Should().BeTrue();
            updatedSupporter1.IsSeen.Should().BeFalse();
            updatedSupporter2.IsLeave.Should().BeTrue();
            updatedSupporter2.IsSeen.Should().BeFalse();
        }

        [Fact]
        public async Task CheckIfAllSupportersLeftAndUnseen_ReturnsTrueIfAllLeftAndUnseen()
        {
            var chatRoomId = Guid.NewGuid();
            var supporter1 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = true, IsSeen = false };
            var supporter2 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = true, IsSeen = false };

            chatServiceDBContext.RoomParticipants.AddRange(supporter1, supporter2);
            await chatServiceDBContext.SaveChangesAsync();

            var response = await chatRepository.CheckIfAllSupportersLeftAndUnseen(chatRoomId);

            response.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task CheckIfAllSupportersLeftAndUnseen_ReturnsFalseIfAnyActive()
        {
            var chatRoomId = Guid.NewGuid();
            var supporter1 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = false, IsSeen = true };
            var supporter2 = new RoomParticipant { ChatRoomId = chatRoomId, UserId = Guid.NewGuid(), IsSupporter = true, IsLeave = true, IsSeen = false };

            chatServiceDBContext.RoomParticipants.AddRange(supporter1, supporter2);
            await chatServiceDBContext.SaveChangesAsync();

            var response = await chatRepository.CheckIfAllSupportersLeftAndUnseen(chatRoomId);

            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task StoreImage_StoresImageSuccessfully()
        {
            var webRootPath = Path.GetTempPath();
            var uploadsPath = Path.Combine(webRootPath, "uploads");

            // Ensure the "uploads" directory exists
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var fileName = "test.jpg";
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.FileName).Returns(fileName);
            mockFile.Setup(f => f.Length).Returns(100);
            mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), default)).Returns(Task.CompletedTask);

            var response = await chatRepository.StoreImage(mockFile.Object, webRootPath);

            response.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
            File.Exists(Path.Combine(webRootPath, "uploads", Path.GetFileName((string)response.Data))).Should().BeTrue();
        }
    }
}
