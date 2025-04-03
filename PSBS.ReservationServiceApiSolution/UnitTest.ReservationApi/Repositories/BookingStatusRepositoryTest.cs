

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Repositories;

namespace UnitTest.ReservationApi.Repositories
{
    public class BookingStatusRepositoryTest
    {
        private readonly ReservationServiceDBContext _context;
        private readonly BookingStatusRepository _repository;

        public BookingStatusRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ReservationServiceDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ReservationServiceDBContext(options);
            _repository = new BookingStatusRepository(_context);
        }

        #region CreateAsync Tests

        [Fact]
        public async Task CreateAsync_ShouldAddNewBookingStatus_WhenStatusDoesNotExist()
        {
            // Arrange
            var newStatus = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "New Status"
            };

            // Act
            var result = await _repository.CreateAsync(newStatus);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("added to database successfully");
            result.Data.Should().BeEquivalentTo(newStatus);

            var dbStatus = await _context.BookingStatuses.FindAsync(newStatus.BookingStatusId);
            dbStatus.Should().NotBeNull();
            dbStatus!.BookingStatusName.Should().Be(newStatus.BookingStatusName);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnFailure_WhenStatusAlreadyExists()
        {
            // Arrange
            var existingStatus = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "Existing Status"
            };
            await _context.BookingStatuses.AddAsync(existingStatus);
            await _context.SaveChangesAsync();

            var duplicateStatus = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "Existing Status"
            };

            // Act
            var result = await _repository.CreateAsync(duplicateStatus);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("already added");
            result.Data.Should().BeNull();
        }

        [Fact]
        public async Task CreateAsync_ShouldHandleException_WhenErrorOccurs()
        {
            // Arrange
            var invalidStatus = new BookingStatus
            {
                BookingStatusName = null! // This will cause an exception
            };

            // Act
            var result = await _repository.CreateAsync(invalidStatus);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Error occured adding new voucher");
        }

        #endregion

        #region GetAllAsync Tests

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllBookingStatuses_WhenDataExists()
        {
            // Arrange
            var status1 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Status 1" };
            var status2 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Status 2" };
            await _context.BookingStatuses.AddRangeAsync(status1, status2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().ContainEquivalentOf(status1);
            result.Should().ContainEquivalentOf(status2);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnEmptyList_WhenNoDataExists()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetAllAsync_ShouldThrowException_WhenErrorOccurs()
        {
            // Arrange - Dispose context to force error
            await _context.DisposeAsync();

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.GetAllAsync());
        }

        #endregion

        #region GetByIdAsync Tests

        [Fact]
        public async Task GetByIdAsync_ShouldReturnBookingStatus_WhenIdExists()
        {
            // Arrange
            var statusId = Guid.NewGuid();
            var expectedStatus = new BookingStatus
            {
                BookingStatusId = statusId,
                BookingStatusName = "Test Status"
            };
            await _context.BookingStatuses.AddAsync(expectedStatus);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(statusId);

            // Assert
            result.Should().NotBeNull();
            result.BookingStatusId.Should().Be(statusId);
            result.BookingStatusName.Should().Be(expectedStatus.BookingStatusName);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenIdDoesNotExist()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(nonExistentId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrowException_WhenErrorOccurs()
        {
            // Arrange - Dispose context to force error
            await _context.DisposeAsync();

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.GetByIdAsync(Guid.NewGuid()));
        }

        #endregion

        #region GetByAsync Tests

        [Fact]
        public async Task GetByAsync_ShouldReturnMatchingStatus_WhenPredicateMatches()
        {
            // Arrange
            var status1 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Active" };
            var status2 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Inactive" };
            await _context.BookingStatuses.AddRangeAsync(status1, status2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(s => s.BookingStatusName == "Active");

            // Assert
            result.Should().NotBeNull();
            result.BookingStatusId.Should().Be(status1.BookingStatusId);
        }

        [Fact]
        public async Task GetByAsync_ShouldReturnNull_WhenNoMatchFound()
        {
            // Arrange
            var status = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Active" };
            await _context.BookingStatuses.AddAsync(status);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(s => s.BookingStatusName == "NonExistent");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByAsync_ShouldThrowException_WhenErrorOccurs()
        {
            // Arrange - Dispose context to force error
            await _context.DisposeAsync();

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.GetByAsync(s => true));
        }

        #endregion

        #region UpdateAsync Tests

        [Fact]
        public async Task UpdateAsync_ShouldUpdateStatus_WhenStatusExists()
        {
            // Arrange
            var originalStatus = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "Original Name"
            };
            await _context.BookingStatuses.AddAsync(originalStatus);
            await _context.SaveChangesAsync();

            var updatedStatus = new BookingStatus
            {
                BookingStatusId = originalStatus.BookingStatusId,
                BookingStatusName = "Updated Name"
            };

            // Act
            var result = await _repository.UpdateAsync(updatedStatus);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("successfully updated");
            result.Data.Should().BeEquivalentTo(updatedStatus);

            var dbStatus = await _context.BookingStatuses.FindAsync(originalStatus.BookingStatusId);
            dbStatus!.BookingStatusName.Should().Be("Updated Name");
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFailure_WhenStatusDoesNotExist()
        {
            // Arrange
            var nonExistentStatus = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "Non-Existent"
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentStatus);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFailure_WhenDuplicateNameExists()
        {
            // Arrange
            var status1 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Status 1" };
            var status2 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Status 2" };
            await _context.BookingStatuses.AddRangeAsync(status1, status2);
            await _context.SaveChangesAsync();

            var updatedStatus = new BookingStatus
            {
                BookingStatusId = status1.BookingStatusId,
                BookingStatusName = "Status 2" // Trying to rename to an existing name
            };

            // Act
            var result = await _repository.UpdateAsync(updatedStatus);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("already added");
        }

        [Fact]
        public async Task UpdateAsync_ShouldHandleException_WhenErrorOccurs()
        {
            // Arrange
            var status = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Test" };
            await _context.BookingStatuses.AddAsync(status);
            await _context.SaveChangesAsync();

            // Force error by disposing context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.UpdateAsync(status);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Error occurred updating the existing booking status");
        }

        #endregion

        #region DeleteAsync Tests

        [Fact]
        public async Task DeleteAsync_ShouldMarkAsDeleted_WhenFirstTimeDeleting()
        {
            // Arrange
            var status = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "To Delete",
                isDeleted = false
            };
            await _context.BookingStatuses.AddAsync(status);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(status);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("marked as deleted");

            var dbStatus = await _context.BookingStatuses.FindAsync(status.BookingStatusId);
            dbStatus!.isDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_ShouldPermanentlyDelete_WhenAlreadyMarkedAsDeletedAndNoReferences()
        {
            // Arrange
            var status = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "To Delete",
                isDeleted = true
            };
            await _context.BookingStatuses.AddAsync(status);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(status);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("permanently deleted");

            var dbStatus = await _context.BookingStatuses.FindAsync(status.BookingStatusId);
            dbStatus.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenStatusHasReferences()
        {
            // Arrange
            var status = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "Referenced Status",
                isDeleted = true
            };
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                BookingStatusId = status.BookingStatusId
            };

            await _context.BookingStatuses.AddAsync(status);
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(status);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("referenced in existing bookings");

            var dbStatus = await _context.BookingStatuses.FindAsync(status.BookingStatusId);
            dbStatus.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenStatusDoesNotExist()
        {
            // Arrange
            var nonExistentStatus = new BookingStatus
            {
                BookingStatusId = Guid.NewGuid(),
                BookingStatusName = "Non-Existent"
            };

            // Act
            var result = await _repository.DeleteAsync(nonExistentStatus);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        [Fact]
        public async Task DeleteAsync_ShouldHandleException_WhenErrorOccurs()
        {
            // Arrange
            var status = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Test" };
            await _context.BookingStatuses.AddAsync(status);
            await _context.SaveChangesAsync();

            // Force error by disposing context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.DeleteAsync(status);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("An error occurred while deleting the booking status.");
        }

        #endregion
    }
}

