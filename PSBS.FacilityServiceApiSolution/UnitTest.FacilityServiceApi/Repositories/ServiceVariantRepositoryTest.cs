using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FakeItEasy;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class ServiceVariantRepositoryTest
    {
        private readonly FacilityServiceDbContext _context;
        private readonly ServiceVariantRepository _repository;

        public ServiceVariantRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new ServiceVariantRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnError_WhenServiceVariantAlreadyExists()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            var response = await _repository.CreateAsync(serviceVariant);

            // Assert
            response.Flag.Should().BeFalse();
            response.Message.Should().Be($"Service Variant with ID {serviceVariant.serviceVariantId} already exists!");
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnSuccess_WhenServiceVariantCreated()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            // Act
            var response = await _repository.CreateAsync(serviceVariant);

            // Assert
            response.Flag.Should().BeTrue();
            response.Message.Should().Be($"{serviceVariant.serviceVariantId} added successfully");
            _context.ServiceVariant.Should().ContainEquivalentOf(serviceVariant);
        }

        [Fact]
        public async Task DeleteAsync_ShouldMarkServiceVariantAsSoftDeleted()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            var response = await _repository.DeleteAsync(serviceVariant);

            // Assert
            response.Flag.Should().BeTrue();
            response.Message.Should().Be($"{serviceVariant.serviceVariantId} is marked as soft deleted successfully");
            _context.ServiceVariant.FirstOrDefault(sv => sv.serviceVariantId == serviceVariant.serviceVariantId)?.isDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteSecondAsync_ShouldPermanentlyDeleteServiceVariant()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = true
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            var response = await _repository.DeleteSecondAsync(serviceVariant);

            // Assert
            response.Flag.Should().BeTrue();
            response.Message.Should().Be($"{serviceVariant.serviceVariantId} is marked as deleted permanently successfully");
            _context.ServiceVariant.Should().NotContain(serviceVariant);
        }

        [Fact]
        public async Task CheckIfServiceHasVariant_ShouldReturnTrue_WhenServiceHasVariant()
        {
            // Arrange
            var serviceId = Guid.NewGuid();
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = serviceId,
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CheckIfServiceHasVariant(serviceId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteByServiceIdAsync_ShouldSoftDeleteAllVariantsForService()
        {
            // Arrange
            var serviceId = Guid.NewGuid();
            var serviceVariants = new List<ServiceVariant>
        {
            new() {
                serviceVariantId = Guid.NewGuid(),
                serviceId = serviceId,
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            },
            new() {
                serviceVariantId = Guid.NewGuid(),
                serviceId = serviceId,
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            }
        };
            await _context.ServiceVariant.AddRangeAsync(serviceVariants);
            await _context.SaveChangesAsync();

            // Act
            var response = await _repository.DeleteByServiceIdAsync(serviceId);

            // Assert
            response.Flag.Should().BeTrue();
            response.Message.Should().Be($"Service variants with service ID {serviceId} is marked as soft deleted successfully");
            _context.ServiceVariant.Where(sv => sv.serviceId == serviceId).All(sv => sv.isDeleted).Should().BeTrue();
        }

        [Fact]
        public async Task CheckIfVariantInBooking_ShouldReturnTrue_WhenVariantInBooking()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var bookingServiceItem = new BookingServiceItem { ServiceVariantId = serviceVariantId };
            await _context.bookingServiceItems.AddAsync(bookingServiceItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CheckIfVariantInBooking(serviceVariantId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnList_WhenVariantsExist()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull().And.HaveCountGreaterThan(0);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnEmptyList_WhenNoVariantsExist()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetByAsync_ShouldReturnVariant_WhenExists()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(sv => sv.serviceVariantId == serviceVariant.serviceVariantId);

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetByAsync_ShouldReturnNull_WhenVariantDoesNotExist()
        {
            // Act
            var result = await _repository.GetByAsync(sv => sv.serviceVariantId == Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnVariant_WhenExists()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(serviceVariant.serviceVariantId);

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenVariantDoesNotExist()
        {
            // Act
            var result = await _repository.GetByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateServiceVariantSuccessfully()
        {
            // Arrange
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = 100.0m,
                serviceContent = "Sample content",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            await _context.ServiceVariant.AddAsync(serviceVariant);
            await _context.SaveChangesAsync();

            // Act
            serviceVariant.servicePrice = 200;
            var response = await _repository.UpdateAsync(serviceVariant);
            var updatedVariant = await _context.ServiceVariant.FindAsync(serviceVariant.serviceVariantId);

            // Assert
            response.Flag.Should().BeTrue();
            response.Message.Should().Be($"{serviceVariant.serviceVariantId} is updated successfully");
            updatedVariant.servicePrice.Should().Be(200);
        }
    }

}