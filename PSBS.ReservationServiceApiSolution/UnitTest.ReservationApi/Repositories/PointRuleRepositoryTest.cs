using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Repositories;


namespace UnitTest.ReservationApi.Repositories
{
    public class PointRuleRepositoryTest
    {
        private readonly ReservationServiceDBContext _context;
        private readonly PointRuleRepository _repository;

        public PointRuleRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ReservationServiceDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ReservationServiceDBContext(options);
            _repository = new PointRuleRepository(_context);
        }

        #region CreateAsync Tests

        [Fact]
        public async Task CreateAsync_ShouldAddNewPointRule_WhenNoActiveRuleExists()
        {
            // Arrange
            var newRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = false
            };

            // Act
            var result = await _repository.CreateAsync(newRule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("added to database successfully");
            result.Data.Should().BeEquivalentTo(newRule);

            var dbRule = await _context.PointRules.FindAsync(newRule.PointRuleId);
            dbRule.Should().NotBeNull();
            dbRule!.PointRuleRatio.Should().Be(newRule.PointRuleRatio);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnFailure_WhenActiveRuleAlreadyExists()
        {
            // Arrange
            var existingActiveRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 5,
                isDeleted = false
            };
            await _context.PointRules.AddAsync(existingActiveRule);
            await _context.SaveChangesAsync();

            var newRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = false
            };

            // Act
            var result = await _repository.CreateAsync(newRule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("inactivate the current Point Rule Ratio");
            result.Data.Should().BeNull();
        }

        
        #endregion

        #region GetAllAsync Tests

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllPointRules_WhenDataExists()
        {
            // Arrange
            var rule1 = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 5, isDeleted = false };
            var rule2 = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 10, isDeleted = true };
            await _context.PointRules.AddRangeAsync(rule1, rule2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().ContainEquivalentOf(rule1);
            result.Should().ContainEquivalentOf(rule2);
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
        public async Task GetByIdAsync_ShouldReturnPointRule_WhenIdExists()
        {
            // Arrange
            var ruleId = Guid.NewGuid();
            var expectedRule = new PointRule
            {
                PointRuleId = ruleId,
                PointRuleRatio = 10,
                isDeleted = false
            };
            await _context.PointRules.AddAsync(expectedRule);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(ruleId);

            // Assert
            result.Should().NotBeNull();
            result.PointRuleId.Should().Be(ruleId);
            result.PointRuleRatio.Should().Be(expectedRule.PointRuleRatio);
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
        public async Task GetByAsync_ShouldReturnMatchingRule_WhenPredicateMatches()
        {
            // Arrange
            var rule1 = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 5, isDeleted = false };
            var rule2 = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 10, isDeleted = true };
            await _context.PointRules.AddRangeAsync(rule1, rule2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(r => r.PointRuleRatio == 5);

            // Assert
            result.Should().NotBeNull();
            result.PointRuleId.Should().Be(rule1.PointRuleId);
        }

        [Fact]
        public async Task GetByAsync_ShouldReturnNull_WhenNoMatchFound()
        {
            // Arrange
            var rule = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 5, isDeleted = false };
            await _context.PointRules.AddAsync(rule);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(r => r.PointRuleRatio == 10);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByAsync_ShouldThrowException_WhenErrorOccurs()
        {
            // Arrange - Dispose context to force error
            await _context.DisposeAsync();

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.GetByAsync(r => true));
        }

        #endregion

        #region GetPointRuleActiveAsync Tests

        [Fact]
        public async Task GetPointRuleActiveAsync_ShouldReturnActiveRule_WhenExists()
        {
            // Arrange
            var activeRule = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 10, isDeleted = false };
            var inactiveRule = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 5, isDeleted = true };
            await _context.PointRules.AddRangeAsync(activeRule, inactiveRule);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetPointRuleActiveAsync();

            // Assert
            result.Should().NotBeNull();
            result.PointRuleId.Should().Be(activeRule.PointRuleId);
            result.isDeleted.Should().BeFalse();
        }

        [Fact]
        public async Task GetPointRuleActiveAsync_ShouldReturnNull_WhenNoActiveRuleExists()
        {
            // Arrange
            var inactiveRule = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 5, isDeleted = true };
            await _context.PointRules.AddAsync(inactiveRule);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetPointRuleActiveAsync();

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetPointRuleActiveAsync_ShouldThrowException_WhenErrorOccurs()
        {
            // Arrange - Dispose context to force error
            await _context.DisposeAsync();

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.GetPointRuleActiveAsync());
        }

        #endregion

        #region UpdateAsync Tests

        [Fact]
        public async Task UpdateAsync_ShouldUpdateRule_WhenRuleExists()
        {
            // Arrange
            var originalRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 5,
                isDeleted = false
            };
            await _context.PointRules.AddAsync(originalRule);
            await _context.SaveChangesAsync();

            var updatedRule = new PointRule
            {
                PointRuleId = originalRule.PointRuleId,
                PointRuleRatio = 10,
                isDeleted = false
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("successfully updated");
            result.Data.Should().BeEquivalentTo(updatedRule);

            var dbRule = await _context.PointRules.FindAsync(originalRule.PointRuleId);
            dbRule!.PointRuleRatio.Should().Be(10);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFailure_WhenRuleDoesNotExist()
        {
            // Arrange
            var nonExistentRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = false
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentRule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFailure_WhenActivatingRuleWithAnotherActive()
        {
            // Arrange
            var existingActiveRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 5,
                isDeleted = false
            };
            var ruleToUpdate = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = true
            };
            await _context.PointRules.AddRangeAsync(existingActiveRule, ruleToUpdate);
            await _context.SaveChangesAsync();

            var updatedRule = new PointRule
            {
                PointRuleId = ruleToUpdate.PointRuleId,
                PointRuleRatio = 10,
                isDeleted = false // Trying to activate while another is active
            };

            // Act
            var result = await _repository.UpdateAsync(updatedRule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("inactivate the current Point Rule Ratio");
        }

        [Fact]
        public async Task UpdateAsync_ShouldHandleException_WhenErrorOccurs()
        {
            // Arrange
            var rule = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 5, isDeleted = false };
            await _context.PointRules.AddAsync(rule);
            await _context.SaveChangesAsync();

            // Force error by disposing context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.UpdateAsync(rule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Error occurred while updating the existing Point Rule.");
        }

        #endregion

        #region DeleteAsync Tests

        [Fact]
        public async Task DeleteAsync_ShouldMarkAsDeleted_WhenFirstTimeDeleting()
        {
            // Arrange
            var rule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = false
            };
            await _context.PointRules.AddAsync(rule);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(rule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("marked as deleted");

            var dbRule = await _context.PointRules.FindAsync(rule.PointRuleId);
            dbRule!.isDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_ShouldPermanentlyDelete_WhenAlreadyMarkedAsDeletedAndNoReferences()
        {
            // Arrange
            var rule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = true
            };
            await _context.PointRules.AddAsync(rule);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(rule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Contain("permanently deleted");

            var dbRule = await _context.PointRules.FindAsync(rule.PointRuleId);
            dbRule.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenRuleHasReferences()
        {
            // Arrange
            var rule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = true
            };
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                PointRuleId = rule.PointRuleId
            };

            await _context.PointRules.AddAsync(rule);
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(rule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("referenced in existing bookings");

            var dbRule = await _context.PointRules.FindAsync(rule.PointRuleId);
            dbRule.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFailure_WhenRuleDoesNotExist()
        {
            // Arrange
            var nonExistentRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = false
            };

            // Act
            var result = await _repository.DeleteAsync(nonExistentRule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        [Fact]
        public async Task DeleteAsync_ShouldHandleException_WhenErrorOccurs()
        {
            // Arrange
            var rule = new PointRule { PointRuleId = Guid.NewGuid(), PointRuleRatio = 10, isDeleted = false };
            await _context.PointRules.AddAsync(rule);
            await _context.SaveChangesAsync();

            // Force error by disposing context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.DeleteAsync(rule);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("An error occurred while deleting the booking type");
        }

        #endregion
    }
}