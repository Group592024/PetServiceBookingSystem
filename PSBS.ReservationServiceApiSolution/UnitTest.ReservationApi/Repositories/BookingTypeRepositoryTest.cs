using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTest.ReservationApi.Repositories
{
    public class BookingTypeRepositoryTest
    {
        private readonly ReservationServiceDBContext _context;
        private readonly BookingTypeRepository _repository;

        public BookingTypeRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ReservationServiceDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ReservationServiceDBContext(options);
            _repository = new BookingTypeRepository(_context);
        }

        #region CreateAsync Tests

        [Fact]
        public async Task CreateAsync_ShouldAddNewBookingType_WhenTypeDoesNotExist()
        {
            // Arrange
            var newType = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "New Type"
            };

            // Act
            var result = await _repository.CreateAsync(newType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("added to database successfully");
            result.Data.Should().BeEquivalentTo(newType);

            var dbType = await _context.BookingTypes.FindAsync(newType.BookingTypeId);
            dbType.Should().NotBeNull();
            dbType!.BookingTypeName.Should().Be(newType.BookingTypeName);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnFailure_WhenTypeAlreadyExists()
        {
            // Arrange
            var existingType = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "Existing Type"
            };
            await _context.BookingTypes.AddAsync(existingType);
            await _context.SaveChangesAsync();

            var duplicateType = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "Existing Type"
            };

            // Act
            var result = await _repository.CreateAsync(duplicateType);

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
            var invalidType = new BookingType
            {
                BookingTypeName = null! // This will cause an exception
            };

            // Act
            var result = await _repository.CreateAsync(invalidType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Error occured adding new voucher");
        }

        #endregion

        #region GetAllAsync Tests

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllBookingTypes_WhenDataExists()
        {
            // Arrange
            var type1 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Type 1" };
            var type2 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Type 2" };
            await _context.BookingTypes.AddRangeAsync(type1, type2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().ContainEquivalentOf(type1);
            result.Should().ContainEquivalentOf(type2);
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
        public async Task GetByIdAsync_ShouldReturnBookingType_WhenIdExists()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            var expectedType = new BookingType
            {
                BookingTypeId = typeId,
                BookingTypeName = "Test Type"
            };
            await _context.BookingTypes.AddAsync(expectedType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(typeId);

            // Assert
            result.Should().NotBeNull();
            result.BookingTypeId.Should().Be(typeId);
            result.BookingTypeName.Should().Be(expectedType.BookingTypeName);
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
        public async Task GetByAsync_ShouldReturnMatchingType_WhenPredicateMatches()
        {
            // Arrange
            var type1 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Hotel" };
            var type2 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Spa" };
            await _context.BookingTypes.AddRangeAsync(type1, type2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(t => t.BookingTypeName == "Hotel");

            // Assert
            result.Should().NotBeNull();
            result.BookingTypeId.Should().Be(type1.BookingTypeId);
        }

        [Fact]
        public async Task GetByAsync_ShouldReturnNull_WhenNoMatchFound()
        {
            // Arrange
            var type = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Hotel" };
            await _context.BookingTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(t => t.BookingTypeName == "NonExistent");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByAsync_ShouldThrowException_WhenErrorOccurs()
        {
            // Arrange - Dispose context to force error
            await _context.DisposeAsync();

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.GetByAsync(t => true));
        }

        #endregion

        #region UpdateAsync Tests

        [Fact]
        public async Task UpdateAsync_ShouldUpdateType_WhenTypeExists()
        {
            // Arrange
            var originalType = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "Original Name"
            };
            await _context.BookingTypes.AddAsync(originalType);
            await _context.SaveChangesAsync();

            var updatedType = new BookingType
            {
                BookingTypeId = originalType.BookingTypeId,
                BookingTypeName = "Updated Name"
            };

            // Act
            var result = await _repository.UpdateAsync(updatedType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("successfully updated");
            result.Data.Should().BeEquivalentTo(updatedType);

            var dbType = await _context.BookingTypes.FindAsync(originalType.BookingTypeId);
            dbType!.BookingTypeName.Should().Be("Updated Name");
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFailure_WhenTypeDoesNotExist()
        {
            // Arrange
            var nonExistentType = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "Non-Existent"
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFailure_WhenDuplicateNameExists()
        {
            // Arrange
            var type1 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Type 1" };
            var type2 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Type 2" };
            await _context.BookingTypes.AddRangeAsync(type1, type2);
            await _context.SaveChangesAsync();

            var updatedType = new BookingType
            {
                BookingTypeId = type1.BookingTypeId,
                BookingTypeName = "Type 2" // Trying to rename to an existing name
            };

            // Act
            var result = await _repository.UpdateAsync(updatedType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("already added");
        }

        [Fact]
        public async Task UpdateAsync_ShouldHandleException_WhenErrorOccurs()
        {
            // Arrange
            var type = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Test" };
            await _context.BookingTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Force error by disposing context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.UpdateAsync(type);

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
            var type = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "To Delete",
                isDeleted = false
            };
            await _context.BookingTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(type);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("marked as deleted");

            var dbType = await _context.BookingTypes.FindAsync(type.BookingTypeId);
            dbType!.isDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_ShouldPermanentlyDelete_WhenAlreadyMarkedAsDeletedAndNoReferences()
        {
            // Arrange
            var type = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "To Delete",
                isDeleted = true
            };
            await _context.BookingTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(type);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("permanently deleted");

            var dbType = await _context.BookingTypes.FindAsync(type.BookingTypeId);
            dbType.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenTypeHasReferences()
        {
            // Arrange
            var type = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "Referenced Type",
                isDeleted = true
            };
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                BookingTypeId = type.BookingTypeId
            };

            await _context.BookingTypes.AddAsync(type);
         var bookingTest=   await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(type);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("referenced in existing bookings");

            var dbType = await _context.BookingTypes.FindAsync(type.BookingTypeId);
            dbType.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenTypeDoesNotExist()
        {
            // Arrange
            var nonExistentType = new BookingType
            {
                BookingTypeId = Guid.NewGuid(),
                BookingTypeName = "Non-Existent"
            };

            // Act
            var result = await _repository.DeleteAsync(nonExistentType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        [Fact]
        public async Task DeleteAsync_ShouldHandleException_WhenErrorOccurs()
        {
            // Arrange
            var type = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Test" };
            await _context.BookingTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Force error by disposing context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.DeleteAsync(type);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("An error occurred while deleting the booking type");
        }

        #endregion
    }
}
