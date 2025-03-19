using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class RoomRepositoryTest
    {
        private readonly FacilityServiceDbContext _context;
        private readonly RoomRepository _repository;

        public RoomRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new RoomRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Test Room Type",
                description = "Description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);
            await _context.SaveChangesAsync();

            var room = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Test Room",
                roomTypeId = roomTypeId,
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = false
            };

            // Act
            var result = await _repository.CreateAsync(room);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{room.roomId} added successfully");
            result.Data.Should().BeOfType<RoomDTO>();
            
            // Verify room was added to database
            var savedRoom = await _context.Room.FindAsync(room.roomId);
            savedRoom.Should().NotBeNull();
            savedRoom.roomName.Should().Be("Test Room");
            savedRoom.status.Should().Be("Free");
            savedRoom.isDeleted.Should().BeFalse();
        }

        [Fact]
        public async Task CreateAsync_WhenRoomTypeDoesNotExist_ReturnFailureResponse()
        {
            // Arrange
            var room = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Test Room",
                roomTypeId = Guid.NewGuid(), // Non-existent room type ID
                description = "Test description",
                roomImage = "test.jpg"
            };

            // Act
            var result = await _repository.CreateAsync(room);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"RoomType with ID {room.roomTypeId} is not active or does not exist!");
        }

        [Fact]
        public async Task CreateAsync_WhenRoomIdAlreadyExists_ReturnFailureResponse()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Test Room Type",
                description = "Description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);

            var existingRoomId = Guid.NewGuid();
            var existingRoom = new Room
            {
                roomId = existingRoomId,
                roomName = "Existing Room",
                roomTypeId = roomTypeId,
                description = "Existing description",
                roomImage = "existing.jpg",
                status = "Free",
                isDeleted = false
            };
            await _context.Room.AddAsync(existingRoom);
            await _context.SaveChangesAsync();

            var newRoom = new Room
            {
                roomId = existingRoomId, // Same ID as existing room
                roomName = "New Room",
                roomTypeId = roomTypeId,
                description = "New description",
                roomImage = "new.jpg"
            };

            // Act
            var result = await _repository.CreateAsync(newRoom);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Room with ID {newRoom.roomId} already exists!");
        }

        [Fact]
        public async Task CreateAsync_WhenRoomNameAlreadyExists_ReturnFailureResponse()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Test Room Type",
                description = "Description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);

            var existingRoom = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Duplicate Room Name",
                roomTypeId = roomTypeId,
                description = "Existing description",
                roomImage = "existing.jpg",
                status = "Free",
                isDeleted = false
            };
            await _context.Room.AddAsync(existingRoom);
            await _context.SaveChangesAsync();

            var newRoom = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Duplicate Room Name", // Same name as existing room
                roomTypeId = roomTypeId,
                description = "New description",
                roomImage = "new.jpg"
            };

            // Act
            var result = await _repository.CreateAsync(newRoom);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Room with name {newRoom.roomName} already exists!");
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomExists_SoftDeleteSuccessfully()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Room to Delete",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = false
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(room);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{room.roomName} has been marked as deleted (soft delete) successfully.");
            
            // Verify room was soft deleted
            var deletedRoom = await _context.Room.FindAsync(roomId);
            deletedRoom.Should().NotBeNull();
            deletedRoom.isDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomDoesNotExist_ReturnFailureResponse()
        {
            // Arrange
            var nonExistentRoom = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Non-existent Room"
            };

            // Act
            var result = await _repository.DeleteAsync(nonExistentRoom);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"{nonExistentRoom.roomId} not found or is already deleted.");
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomHasHistory_PreventPermanentDeletion()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Room with History",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = true // Already soft deleted
            };
            await _context.Room.AddAsync(room);

            var roomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                RoomId = roomId,
                Status = "In Use"
            };
            await _context.RoomHistories.AddAsync(roomHistory);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(room);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Room {room.roomName} cannot be permanently deleted as it has room history.");
            
            // Verify room still exists
            var existingRoom = await _context.Room.FindAsync(roomId);
            existingRoom.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomAlreadySoftDeleted_PermanentlyDeletesIfNoHistory()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Soft Deleted Room",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = true // Already soft deleted
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(room);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{room.roomName} has been permanently deleted.");

            // Verify room was permanently deleted
            var deletedRoom = await _context.Room.FindAsync(roomId);
            deletedRoom.Should().BeNull();
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllRooms()
        {
            // Arrange
            var rooms = new List<Room>
            {
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Room 1",
                    roomTypeId = Guid.NewGuid(),
                    status = "Free",
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Room 2",
                    roomTypeId = Guid.NewGuid(),
                    status = "In Use",
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Room 3",
                    roomTypeId = Guid.NewGuid(),
                    status = "Free",
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = true
                }
            };

            await _context.Room.AddRangeAsync(rooms);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3);
            result.Should().ContainEquivalentOf(rooms[0]);
            result.Should().ContainEquivalentOf(rooms[1]);
            result.Should().ContainEquivalentOf(rooms[2]);
        }
        [Fact]
        public async Task GetAllAsync_ReturnsEmptyList_WhenNoRoomsExist()
        {
            // Arrange

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
        [Fact]
        public async Task GetByIdAsync_WhenRoomExists_ReturnRoom()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Test Room",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = false
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(roomId);

            // Assert
            result.Should().NotBeNull();
            result.roomId.Should().Be(roomId);
            result.roomName.Should().Be("Test Room");
        }

        [Fact]
        public async Task GetByIdAsync_WhenRoomDoesNotExist_ReturnNull()
        {
            // Arrange
            var nonExistentRoomId = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(nonExistentRoomId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Test Room Type",
                description = "Description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);

            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Original Room",
                roomTypeId = roomTypeId,
                description = "Original description",
                roomImage = "original.jpg",
                status = "Free",
                isDeleted = false
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            var updatedRoom = new Room
            {
                roomId = roomId,
                roomName = "Updated Room",
                roomTypeId = roomTypeId,
                description = "Updated description",
                roomImage = "updated.jpg",
                status = "Free",
                isDeleted = false
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRoom);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{roomId} is updated successfully");
            
            // Verify room was updated in database
            var savedRoom = await _context.Room.FindAsync(roomId);
            savedRoom.Should().NotBeNull();
            savedRoom.roomName.Should().Be("Updated Room");
            savedRoom.description.Should().Be("Updated description");
            savedRoom.roomImage.Should().Be("updated.jpg");
        }

        [Fact]
        public async Task UpdateAsync_WhenRoomInUse_ReturnFailureResponse()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "In Use Room",
                roomTypeId = Guid.NewGuid(),
                description = "Original description",
                roomImage = "original.jpg",
                status = "In Use", // Room is in use
                isDeleted = false
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            var updatedRoom = new Room
            {
                roomId = roomId,
                roomName = "Updated Room",
                roomTypeId = Guid.NewGuid(),
                description = "Updated description",
                roomImage = "updated.jpg",
                status = "Free"
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRoom);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Room {updatedRoom.roomName} cannot be updated as its status is 'In Use'.");
        }

        [Fact]
        public async Task UpdateAsync_WhenDuplicateRoomName_ReturnFailureResponse()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            
            // First room
            var room1 = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Existing Room",
                roomTypeId = roomTypeId,
                status = "Free",
                description = "Description",
                roomImage = "room.jpg",
                isDeleted = false
            };
            
            // Second room to be updated
            var room2Id = Guid.NewGuid();
            var room2 = new Room
            {
                roomId = room2Id,
                roomName = "Room to Update",
                roomTypeId = roomTypeId,
                status = "Free",
                description = "Description",
                roomImage = "room.jpg",
                isDeleted = false
            };
            
            await _context.Room.AddRangeAsync(room1, room2);
            await _context.SaveChangesAsync();

            var updatedRoom = new Room
            {
                roomId = room2Id,
                roomName = "Existing Room", // Trying to update to a name that already exists
                roomTypeId = roomTypeId,
                description = "Updated description",
                roomImage = "updated.jpg",
                status = "Free"
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRoom);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Room with name {updatedRoom.roomName} already exists!");
        }

        [Fact]
        public async Task UpdateAsync_WhenRoomDoesNotExist_ReturnFailureResponse()
        {
            // Arrange
            var nonExistentRoom = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Non-existent Room",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free"
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentRoom);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Room with ID {nonExistentRoom.roomId} not found");
        }

        [Fact]
        public async Task ListAvailableRoomsAsync_ReturnsOnlyAvailableRooms()
        {
            // Arrange
            var rooms = new List<Room>
            {
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Available Room 1",
                    roomTypeId = Guid.NewGuid(),
                    status = "Free",
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Available Room 2",
                    roomTypeId = Guid.NewGuid(),
                    status = "Free",                    
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "In Use Room",
                    roomTypeId = Guid.NewGuid(),
                    status = "In Use",                    
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Deleted Room",
                    roomTypeId = Guid.NewGuid(),
                    status = "Free",                    
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = true
                }
            };

            await _context.Room.AddRangeAsync(rooms);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailableRoomsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(r => r.roomName == "Available Room 1");
            result.Should().Contain(r => r.roomName == "Available Room 2");
            result.Should().NotContain(r => r.roomName == "In Use Room");
            result.Should().NotContain(r => r.roomName == "Deleted Room");
        }

        [Fact]
        public async Task ListAvailableRoomsAsync_ReturnsEmptyList_WhenNoAvailableRoomsExist()
        {
            // Arrange
            var rooms = new List<Room>
            {
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "In Use Room 1",
                    roomTypeId = Guid.NewGuid(),
                    status = "In Use",
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "In Use Room 2",
                    roomTypeId = Guid.NewGuid(),
                    status = "In Use",
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Deleted Room",
                    roomTypeId = Guid.NewGuid(),
                    status = "Free",
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = true
                }
            };

            await _context.Room.AddRangeAsync(rooms);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailableRoomsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetRoomDetailsAsync_WhenRoomExists_ReturnRoom()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Test Room",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = false
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetRoomDetailsAsync(roomId);

            // Assert
            result.Should().NotBeNull();
            result.roomId.Should().Be(roomId);
            result.roomName.Should().Be("Test Room");
        }

        [Fact]
        public async Task GetRoomDetailsAsync_WhenRoomDoesNotExist_ThrowsException()
        {
            // Arrange
            var nonExistentRoomId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _repository.GetRoomDetailsAsync(nonExistentRoomId));
        }

        [Fact]
        public async Task GetRoomDetailsAsync_WhenRoomIsDeleted_ThrowsException()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Deleted Room",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = true // Room is deleted
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _repository.GetRoomDetailsAsync(roomId));
        }

        [Fact]
        public async Task GetByAsync_WhenRoomExists_ReturnRoom()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                roomId = roomId,
                roomName = "Test Room",
                roomTypeId = Guid.NewGuid(),
                description = "Test description",
                roomImage = "test.jpg",
                status = "Free",
                isDeleted = false
            };
            await _context.Room.AddAsync(room);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(r => r.roomId == roomId);

            // Assert
            result.Should().NotBeNull();
            result.roomId.Should().Be(roomId);
            result.roomName.Should().Be("Test Room");
        }

        [Fact]
        public async Task GetByAsync_WhenRoomDoesNotExist_ThrowsException()
        {
            // Arrange
            var nonExistentRoomId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _repository.GetByAsync(r => r.roomId == nonExistentRoomId));
        }
    }
}

