using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Repositories;

namespace UnitTest.ReservationApi.Repositories
{
    public class PaymentTypeRepositoryTest
    {
        private readonly ReservationServiceDBContext _context;
        private readonly PaymentTypeRepository _repository;

        public PaymentTypeRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ReservationServiceDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ReservationServiceDBContext(options);
            _repository = new PaymentTypeRepository(_context);
        }

        #region CreateAsync Tests

        [Fact]
        public async Task CreateAsync_ShouldAddNewPaymentType_WhenTypeDoesNotExist()
        {
            // Arrange
            var newType = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "Credit Card"
            };

            // Act
            var result = await _repository.CreateAsync(newType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("added to database successfully");
            result.Data.Should().BeEquivalentTo(newType);

            var dbType = await _context.PaymentTypes.FindAsync(newType.PaymentTypeId);
            dbType.Should().NotBeNull();
            dbType!.PaymentTypeName.Should().Be(newType.PaymentTypeName);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnFailure_WhenTypeAlreadyExists()
        {
            // Arrange
            var existingType = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "PayPal"
            };
            await _context.PaymentTypes.AddAsync(existingType);
            await _context.SaveChangesAsync();

            var duplicateType = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "PayPal"
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
            var invalidType = new PaymentType
            {
                PaymentTypeName = null! // This will cause an exception
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
        public async Task GetAllAsync_ShouldReturnAllPaymentTypes_WhenDataExists()
        {
            // Arrange
            var type1 = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Credit Card" };
            var type2 = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Bank Transfer" };
            await _context.PaymentTypes.AddRangeAsync(type1, type2);
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
        public async Task GetByIdAsync_ShouldReturnPaymentType_WhenIdExists()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            var expectedType = new PaymentType
            {
                PaymentTypeId = typeId,
                PaymentTypeName = "Credit Card"
            };
            await _context.PaymentTypes.AddAsync(expectedType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(typeId);

            // Assert
            result.Should().NotBeNull();
            result.PaymentTypeId.Should().Be(typeId);
            result.PaymentTypeName.Should().Be(expectedType.PaymentTypeName);
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
            var type1 = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Credit Card" };
            var type2 = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "PayPal" };
            await _context.PaymentTypes.AddRangeAsync(type1, type2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(t => t.PaymentTypeName == "Credit Card");

            // Assert
            result.Should().NotBeNull();
            result.PaymentTypeId.Should().Be(type1.PaymentTypeId);
        }

        [Fact]
        public async Task GetByAsync_ShouldReturnNull_WhenNoMatchFound()
        {
            // Arrange
            var type = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Credit Card" };
            await _context.PaymentTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(t => t.PaymentTypeName == "NonExistent");

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
            var originalType = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "Credit Card"
            };
            await _context.PaymentTypes.AddAsync(originalType);
            await _context.SaveChangesAsync();

            var updatedType = new PaymentType
            {
                PaymentTypeId = originalType.PaymentTypeId,
                PaymentTypeName = "Debit Card"
            };

            // Act
            var result = await _repository.UpdateAsync(updatedType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("successfully updated");
            result.Data.Should().BeEquivalentTo(updatedType);

            var dbType = await _context.PaymentTypes.FindAsync(originalType.PaymentTypeId);
            dbType!.PaymentTypeName.Should().Be("Debit Card");
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFailure_WhenTypeDoesNotExist()
        {
            // Arrange
            var nonExistentType = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "Non-Existent"
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
            var type1 = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Credit Card" };
            var type2 = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "PayPal" };
            await _context.PaymentTypes.AddRangeAsync(type1, type2);
            await _context.SaveChangesAsync();

            var updatedType = new PaymentType
            {
                PaymentTypeId = type1.PaymentTypeId,
                PaymentTypeName = "PayPal" // Trying to rename to an existing name
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
            var type = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Test" };
            await _context.PaymentTypes.AddAsync(type);
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
            var type = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "To Delete",
                isDeleted = false
            };
            await _context.PaymentTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(type);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("marked as deleted");

            var dbType = await _context.PaymentTypes.FindAsync(type.PaymentTypeId);
            dbType!.isDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_ShouldPermanentlyDelete_WhenAlreadyMarkedAsDeletedAndNoReferences()
        {
            // Arrange
            var type = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "To Delete",
                isDeleted = true
            };
            await _context.PaymentTypes.AddAsync(type);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(type);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("permanently deleted");

            var dbType = await _context.PaymentTypes.FindAsync(type.PaymentTypeId);
            dbType.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenTypeHasReferences()
        {
            // Arrange
            var type = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "Referenced Type",
                isDeleted = true
            };
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                PaymentTypeId = type.PaymentTypeId
            };

            await _context.PaymentTypes.AddAsync(type);
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(type);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("referenced in existing bookings");

            var dbType = await _context.PaymentTypes.FindAsync(type.PaymentTypeId);
            dbType.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenTypeDoesNotExist()
        {
            // Arrange
            var nonExistentType = new PaymentType
            {
                PaymentTypeId = Guid.NewGuid(),
                PaymentTypeName = "Non-Existent"
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
            var type = new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Test" };
            await _context.PaymentTypes.AddAsync(type);
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