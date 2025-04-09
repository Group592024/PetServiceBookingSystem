using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using Xunit;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class RoomHistoryRepositoryTest
    {
        private readonly FacilityServiceDbContext _context;
        private readonly RoomHistoryRepository _repository;

        public RoomHistoryRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new RoomHistoryRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_WithValidEntity_ReturnsSuccessResponse()
        {
            // Arrange
            var roomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                PetId = Guid.NewGuid(),
                RoomId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                Status = "Pending",
                BookingStartDate = DateTime.Now,
                BookingEndDate = DateTime.Now.AddDays(1),
                BookingCamera = true
            };

            // Act
            var result = await _repository.CreateAsync(roomHistory);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Create room history successfully");

            // Verify room history was added to database
            var savedHistory = await _context.RoomHistories.FindAsync(roomHistory.RoomHistoryId);
            savedHistory.Should().NotBeNull();
            savedHistory.Status.Should().Be("Pending");
        }

        [Fact]
        public async Task CreateAsync_WhenSaveFails_ReturnsErrorResponse()
        {
            // Arrange
            var roomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                Status = "Pending"
            };

            // Simulate DB failure by disposing the context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.CreateAsync(roomHistory);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Error occured adding new room history");
        }

        [Fact]
        public async Task GetRoomHistoryByBookingId_WithValidId_ReturnsRoomHistories()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var roomHistories = new List<RoomHistory>
            {
                new RoomHistory {
                    RoomHistoryId = Guid.NewGuid(),
                    BookingId = bookingId,
                    Status = "Pending",
                    BookingStartDate = DateTime.Now,
                    BookingEndDate = DateTime.Now.AddDays(1)
                },
                new RoomHistory {
                    RoomHistoryId = Guid.NewGuid(),
                    BookingId = bookingId,
                    Status = "Pending",
                    BookingStartDate = DateTime.Now,
                    BookingEndDate = DateTime.Now.AddDays(1)
                },
                new RoomHistory {
                    RoomHistoryId = Guid.NewGuid(),
                    BookingId = Guid.NewGuid(), // Different booking
                    Status = "Pending",
                    BookingStartDate = DateTime.Now,
                    BookingEndDate = DateTime.Now.AddDays(1)
                }
            };

            await _context.RoomHistories.AddRangeAsync(roomHistories);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetRoomHistoryByBookingId(bookingId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().OnlyContain(rh => rh.BookingId == bookingId);
        }

        [Fact]
        public async Task GetRoomHistoryByBookingId_WithNoMatches_ReturnsEmptyList()
        {
            // Arrange
            var bookingId = Guid.NewGuid();

            // Act
            var result = await _repository.GetRoomHistoryByBookingId(bookingId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task UpdateAsync_WithValidEntity_ReturnsSuccessResponse()
        {
            // Arrange
            var roomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                Status = "Pending",
                CheckInDate = null,
                CheckOutDate = null,
                BookingStartDate = DateTime.Now,
                BookingEndDate = DateTime.Now.AddDays(1)
            };

            await _context.RoomHistories.AddAsync(roomHistory);
            await _context.SaveChangesAsync();

            var updatedRoomHistory = new RoomHistory
            {
                RoomHistoryId = roomHistory.RoomHistoryId,
                Status = "CheckedIn",
                CheckInDate = DateTime.Now,
                CheckOutDate = null,
                BookingStartDate = roomHistory.BookingStartDate,
                BookingEndDate = roomHistory.BookingEndDate
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRoomHistory);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Update room history successfully");

            // Verify changes were saved
            var savedHistory = await _context.RoomHistories.FindAsync(roomHistory.RoomHistoryId);
            savedHistory.Should().NotBeNull();
            savedHistory.Status.Should().Be("CheckedIn");
            savedHistory.CheckInDate.Should().NotBeNull();
        }

        [Fact]
        public async Task UpdateAsync_WhenEntityNotFound_ReturnsErrorResponse()
        {
            // Arrange
            var nonExistentRoomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                Status = "CheckedIn"
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentRoomHistory);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Cannot update room history due to errors");
        }

        [Fact]
        public async Task UpdateAsync_WhenSaveFails_ReturnsErrorResponse()
        {
            // Arrange
            var roomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                Status = "Pending"
            };

            await _context.RoomHistories.AddAsync(roomHistory);
            await _context.SaveChangesAsync();

            var updatedRoomHistory = new RoomHistory
            {
                RoomHistoryId = roomHistory.RoomHistoryId,
                Status = "CheckedIn"
            };

            // Simulate DB failure by disposing the context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.UpdateAsync(updatedRoomHistory);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Error occured update new room history");
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllRoomHistories()
        {
            // Arrange
            var roomHistories = new List<RoomHistory>
            {
                new RoomHistory {
                    RoomHistoryId = Guid.NewGuid(),
                    Status = "Pending",
                    BookingStartDate = DateTime.Now,
                    BookingEndDate = DateTime.Now.AddDays(1)
                },
                new RoomHistory {
                    RoomHistoryId = Guid.NewGuid(),
                    Status = "CheckedIn",
                    BookingStartDate = DateTime.Now,
                    BookingEndDate = DateTime.Now.AddDays(1)
                },
                new RoomHistory {
                    RoomHistoryId = Guid.NewGuid(),
                    Status = "Completed",
                    BookingStartDate = DateTime.Now,
                    BookingEndDate = DateTime.Now.AddDays(1)
                }
            };

            await _context.RoomHistories.AddRangeAsync(roomHistories);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3);
            result.Should().ContainEquivalentOf(roomHistories[0]);
            result.Should().ContainEquivalentOf(roomHistories[1]);
            result.Should().ContainEquivalentOf(roomHistories[2]);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsEmptyList_WhenNoRoomHistoriesExist()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
    }
}