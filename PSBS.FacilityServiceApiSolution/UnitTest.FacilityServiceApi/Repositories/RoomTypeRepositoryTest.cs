using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FakeItEasy;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class RoomTypeRepositoryTest
    {
        private readonly FacilityServiceDbContext _context;
        private readonly RoomTypeRepository _repository;

        public RoomTypeRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new RoomTypeRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var roomType = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "Test Room Type",
                price = 100.00m,
                description = "Test description"
            };

            // Act
            var result = await _repository.CreateAsync(roomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{roomType.name} added successfully");
            result.Data.Should().BeOfType<RoomType>();
            
            // Verify room type was added to database
            var savedRoomType = await _context.RoomType.FindAsync(roomType.roomTypeId);
            savedRoomType.Should().NotBeNull();
            savedRoomType.name.Should().Be("Test Room Type");
            savedRoomType.isDeleted.Should().BeFalse();
        }

        [Fact]
        public async Task CreateAsync_WhenRoomTypeIdAlreadyExists_ReturnFailureResponse()
        {
            // Arrange
            var existingRoomTypeId = Guid.NewGuid();
            var existingRoomType = new RoomType
            {
                roomTypeId = existingRoomTypeId,
                name = "Existing Room Type",
                price = 100.00m,
                description = "Existing description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(existingRoomType);
            await _context.SaveChangesAsync();

            var newRoomType = new RoomType
            {
                roomTypeId = existingRoomTypeId, // Same ID as existing room type
                name = "New Room Type",
                price = 150.00m,
                description = "New description"
            };

            // Act
            var result = await _repository.CreateAsync(newRoomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"RoomType with ID {newRoomType.roomTypeId} already exists!");
        }

        [Fact]
        public async Task CreateAsync_WhenRoomTypeNameAlreadyExists_ReturnFailureResponse()
        {
            // Arrange
            var existingRoomType = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "Duplicate Room Type Name",
                price = 100.00m,
                description = "Existing description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(existingRoomType);
            await _context.SaveChangesAsync();

            var newRoomType = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "duplicate room type name", // Same name as existing room type (case insensitive)
                price = 150.00m,
                description = "New description"
            };

            // Act
            var result = await _repository.CreateAsync(newRoomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"RoomType with name '{newRoomType.name}' already exists!");
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomTypeExistsWithNoLinkedRooms_SoftDeleteSuccessfully()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Room Type to Delete",
                price = 100.00m,
                description = "Test description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(roomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("RoomType and associated rooms soft deleted successfully.");
            result.Data.Should().BeOfType<RoomTypeDTO>();
            
            // Verify room type was soft deleted
            var deletedRoomType = await _context.RoomType.FindAsync(roomTypeId);
            deletedRoomType.Should().NotBeNull();
            deletedRoomType.isDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomTypeExistsWithLinkedRooms_SoftDeleteRoomTypeAndRooms()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Room Type with Rooms",
                price = 100.00m,
                description = "Test description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);

            var linkedRooms = new List<Room>
            {
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Linked Room 1",
                    roomTypeId = roomTypeId,
                    status = "Free",                    
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Linked Room 2",
                    roomTypeId = roomTypeId,
                    status = "Free",                    
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                }
            };
            await _context.Room.AddRangeAsync(linkedRooms);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(roomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("RoomType and associated rooms soft deleted successfully.");
            
            // Verify room type was soft deleted
            var deletedRoomType = await _context.RoomType.FindAsync(roomTypeId);
            deletedRoomType.Should().NotBeNull();
            deletedRoomType.isDeleted.Should().BeTrue();
            
            // Verify linked rooms were soft deleted
            var rooms = await _context.Room.Where(r => r.roomTypeId == roomTypeId).ToListAsync();
            rooms.Should().HaveCount(2);
            rooms.All(r => r.isDeleted).Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomTypeAlreadySoftDeletedWithNoLinkedRooms_PermanentlyDelete()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Soft Deleted Room Type",
                price = 100.00m,
                description = "Test description",
                isDeleted = true // Already soft deleted
            };
            await _context.RoomType.AddAsync(roomType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(roomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"RoomType with name {roomType.name} has been permanently deleted.");
            
            // Verify room type was permanently deleted
            var deletedRoomType = await _context.RoomType.FindAsync(roomTypeId);
            deletedRoomType.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomTypeAlreadySoftDeletedWithLinkedRooms_PreventPermanentDeletion()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Soft Deleted Room Type with Rooms",
                price = 100.00m,
                description = "Test description",
                isDeleted = true 
            };
            await _context.RoomType.AddAsync(roomType);

            var linkedRoom = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Linked Room",
                roomTypeId = roomTypeId,
                status = "Free",
                description = "Description",
                roomImage = "room.jpg",
                isDeleted = true
            };
            await _context.Room.AddAsync(linkedRoom);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(roomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Cannot permanently delete RoomType with name {roomType.name} because there are linked rooms.");
            
            // Verify room type still exists
            var existingRoomType = await _context.RoomType.FindAsync(roomTypeId);
            existingRoomType.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteAsync_WhenRoomTypeDoesNotExist_ReturnFailureResponse()
        {
            // Arrange
            var nonExistentRoomType = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "Non-existent Room Type"
            };

            // Act
            var result = await _repository.DeleteAsync(nonExistentRoomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("RoomType not found.");
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllRoomTypes()
        {
            // Arrange
            var roomTypes = new List<RoomType>
            {
                new RoomType
                {
                    roomTypeId = Guid.NewGuid(),
                    name = "Room Type 1",
                    price = 100.00m,                
                    description = "Description",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.NewGuid(),
                    name = "Room Type 2",
                    price = 150.00m,
                    description = "Description",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.NewGuid(),
                    name = "Room Type 3",
                    price = 200.00m,                
                    description = "Description",
                    isDeleted = true
                }
            };

            await _context.RoomType.AddRangeAsync(roomTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3);
            result.Should().ContainEquivalentOf(roomTypes[0]);
            result.Should().ContainEquivalentOf(roomTypes[1]);
            result.Should().ContainEquivalentOf(roomTypes[2]);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsEmptyList_WhenNoRoomTypesExist()
        {
            // Arrange

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetByIdAsync_WhenRoomTypeExists_ReturnRoomType()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Test Room Type",
                price = 100.00m,
                description = "Test description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(roomTypeId);

            // Assert
            result.Should().NotBeNull();
            result.roomTypeId.Should().Be(roomTypeId);
            result.name.Should().Be("Test Room Type");
        }

        [Fact]
        public async Task GetByIdAsync_WhenRoomTypeDoesNotExist_ReturnNull()
        {
            // Arrange
            var nonExistentRoomTypeId = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(nonExistentRoomTypeId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByAsync_WhenRoomTypeExists_ReturnRoomType()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Test Room Type",
                price = 100.00m,
                description = "Test description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(rt => rt.roomTypeId == roomTypeId);

            // Assert
            result.Should().NotBeNull();
            result.roomTypeId.Should().Be(roomTypeId);
            result.name.Should().Be("Test Room Type");
        }

        [Fact]
        public async Task GetByAsync_WhenRoomTypeDoesNotExist_ThrowsException()
        {
            // Arrange
            var nonExistentRoomTypeId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _repository.GetByAsync(rt => rt.roomTypeId == nonExistentRoomTypeId));
        }

        [Fact]
        public async Task UpdateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Original Room Type",
                price = 100.00m,
                description = "Original description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);
            await _context.SaveChangesAsync();

            var updatedRoomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Updated Room Type",
                price = 150.00m,
                description = "Updated description",
                isDeleted = false
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRoomType);

            // Assert
            result.Should().NotBeNull();
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{updatedRoomType.name} updated successfully");
            result.Data.Should().BeOfType<RoomTypeDTO>();
            
            // Verify room type was updated in database
            var savedRoomType = await _context.RoomType.FindAsync(roomTypeId);
            savedRoomType.Should().NotBeNull();
            savedRoomType.name.Should().Be("Updated Room Type");
            savedRoomType.price.Should().Be(150.00m);
            savedRoomType.description.Should().Be("Updated description");
        }

        [Fact]
        public async Task UpdateAsync_WhenRoomTypeDoesNotExist_ReturnFailureResponse()
        {
            // Arrange
            var nonExistentRoomType = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "Non-existent Room Type",
                price = 100.00m,
                description = "Test description"
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentRoomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"RoomType with ID {nonExistentRoomType.roomTypeId} not found or already deleted.");
        }

        [Fact]
        public async Task UpdateAsync_WhenDuplicateRoomTypeName_ReturnFailureResponse()
        {
            // Arrange
            // First room type
            var roomType1 = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "Existing Room Type",
                price = 100.00m,
                description = "Existing description",
                isDeleted = false
            };
            
            // Second room type to be updated
            var roomType2Id = Guid.NewGuid();
            var roomType2 = new RoomType
            {
                roomTypeId = roomType2Id,
                name = "Room Type to Update",
                price = 150.00m,
                description = "Original description",
                isDeleted = false
            };
            
            await _context.RoomType.AddRangeAsync(roomType1, roomType2);
            await _context.SaveChangesAsync();

            var updatedRoomType = new RoomType
            {
                roomTypeId = roomType2Id,
                name = "existing room type", // Trying to update to a name that already exists (case insensitive)
                price = 200.00m,
                description = "Updated description",
                isDeleted = false
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRoomType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"RoomType with name '{updatedRoomType.name}' already exists!");
        }

        [Fact]
        public async Task ListAvailableRoomTypeAsync_ReturnsOnlyNonDeletedRoomTypes()
        {
            // Arrange
            var roomTypes = new List<RoomType>
            {
                new RoomType
                {
                    roomTypeId = Guid.NewGuid(),
                    name = "Available Room Type 1",
                    price = 100.00m,
                    description = "Description",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.NewGuid(),
                    name = "Available Room Type 2",
                    price = 150.00m,
                    description = "Description",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.NewGuid(),
                    name = "Deleted Room Type",
                    price = 200.00m,
                    description = "Description",
                    isDeleted = true
                }
            };

            await _context.RoomType.AddRangeAsync(roomTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailableRoomTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(rt => rt.name == "Available Room Type 1");
            result.Should().Contain(rt => rt.name == "Available Room Type 2");
            result.Should().NotContain(rt => rt.name == "Deleted Room Type");
        }

        [Fact]
        public async Task ListAvailableRoomTypeAsync_ReturnsEmptyList_WhenNoRoomTypesExist()
        {
            // Arrange
            // Act
            var result = await _repository.ListAvailableRoomTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task ListAvailableRoomTypeAsync_IncludesRoomsInResult()
        {
            // Arrange
            var roomTypeId = Guid.NewGuid();
            var roomType = new RoomType
            {
                roomTypeId = roomTypeId,
                name = "Room Type with Rooms",
                price = 100.00m,
                description = "Test description",
                isDeleted = false
            };
            await _context.RoomType.AddAsync(roomType);

            var rooms = new List<Room>
            {
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Room 1",
                    roomTypeId = roomTypeId,
                    status = "Free",                    
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                },
                new Room
                {
                    roomId = Guid.NewGuid(),
                    roomName = "Room 2",
                    roomTypeId = roomTypeId,
                    status = "Free",                    
                    description = "Description",
                    roomImage = "room.jpg",
                    isDeleted = false
                }
            };
            await _context.Room.AddRangeAsync(rooms);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailableRoomTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            
            var retrievedRoomType = result.First();
            retrievedRoomType.name.Should().Be("Room Type with Rooms");
            retrievedRoomType.Rooms.Should().NotBeNull();
            retrievedRoomType.Rooms.Should().HaveCount(2);
        }

    }
}
