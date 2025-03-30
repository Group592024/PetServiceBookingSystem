using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class ServiceRepositoryTest : IDisposable

    {
        private readonly FacilityServiceDbContext _context;
        private readonly ServiceRepository _repository;

        public ServiceRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new ServiceRepository(_context);


        }

        [Fact]
        public async Task CreateAsync_WhenServiceAlreadyExists_ShouldReturnFailureResponse()
        {
            // Arrange
            var existingService = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = Guid.NewGuid(),
                serviceName = "Test Service",
                serviceImage = "test.jpg",
                serviceDescription = "Test Description",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };
            _context.Service.Add(existingService);
            await _context.SaveChangesAsync();

            var newService = new Service { serviceId = existingService.serviceId, serviceName = "Grooming" };

            // Act
            var result = await _repository.CreateAsync(newService);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Service with ID {newService.serviceId} already exists!");
        }

        [Fact]
        public async Task CreateAsync_WhenServiceDoesNotExist_ShouldReturnSuccessResponse()
        {
            // Arrange
            var newService = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = Guid.NewGuid(),
                serviceName = "Test Service",
                serviceImage = "test.jpg",
                serviceDescription = "Test Description",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false
            };

            // Act
            var result = await _repository.CreateAsync(newService);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{newService.serviceId} added successfully");
        }

        [Fact]
        public async Task DeleteAsync_WhenServiceExists_ShouldMarkAsDeleted()
        {
            // Arrange
            var serviceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Grooming",
                description = "description"
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            var service = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = serviceType.serviceTypeId,
                serviceName = "Test Service",
                serviceImage = "test.jpg",
                serviceDescription = "Test Description",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false,
                ServiceType = serviceType
            };
            await _context.Service.AddAsync(service);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(service);
            Console.WriteLine(result);
            _context.Entry(service).Reload();

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{service.serviceId} is marked as soft deleted successfully");

            var deletedService = await _repository.GetByIdAsync(service.serviceId);
            deletedService.isDeleted.Should().BeTrue();
        }


        [Fact]
        public async Task DeleteSecondAsync_WhenServiceExists_ShouldDeletePermanently()
        {
            // Arrange
            var serviceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Grooming",
                description = "description"
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            var service = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = serviceType.serviceTypeId,
                serviceName = "Test Service",
                serviceImage = "test.jpg",
                serviceDescription = "Test Description",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false,
                ServiceType = serviceType
            };
            _context.Service.Add(service);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteSecondAsync(service);
            Console.WriteLine(result);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{service.serviceId} is deleted permanently successfully");

            var deletedService = await _context.Service.FindAsync(service.serviceId);
            deletedService.Should().BeNull();
        }


        [Fact]
        public async Task CheckIfServiceHasVariantInBooking_WhenServiceHasVariant_ShouldReturnTrue()
        {
            // Arrange
            var service = new Service { serviceId = Guid.NewGuid(), serviceName = "Grooming1", serviceImage = "", serviceDescription = "Pet grooming service1", isDeleted = false };
            var serviceVariant = new ServiceVariant { serviceVariantId = Guid.NewGuid(), serviceId = service.serviceId, serviceContent = "haha", servicePrice = 100, createAt = DateTime.UtcNow, updateAt = DateTime.UtcNow, isDeleted = false };
            var bookingItem = new BookingServiceItem { BookingServiceItemId = Guid.NewGuid(), ServiceVariantId = serviceVariant.serviceVariantId, ServiceVariant = serviceVariant, Price = 50, CreateAt = DateTime.UtcNow, UpdateAt = DateTime.UtcNow };

            _context.Service.Add(service);
            _context.ServiceVariant.Add(serviceVariant);
            _context.bookingServiceItems.Add(bookingItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CheckIfServiceHasVariantInBooking(service.serviceId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task GetAllAsync_WhenServicesExist_ShouldReturnList()
        {
            // Arrange
            var serviceType = new ServiceType { serviceTypeId = Guid.NewGuid(), typeName = "Grooming", description = "description" };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            var services = new List<Service>
    {
        new Service { serviceId = Guid.NewGuid(), serviceTypeId = serviceType.serviceTypeId, serviceName = "Grooming1", serviceImage = "", serviceDescription = "Pet grooming service1", isDeleted = false, ServiceType = serviceType },
        new Service { serviceId = Guid.NewGuid(), serviceTypeId = serviceType.serviceTypeId, serviceName = "Grooming2", serviceImage = "", serviceDescription = "Pet grooming service2", isDeleted = false, ServiceType = serviceType }
    };

            await _context.Service.AddRangeAsync(services);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().ContainEquivalentOf(services[0]);
            result.Should().ContainEquivalentOf(services[1]);
        }


        [Fact]
        public async Task GetAllAsync_WhenNoServicesExist_ShouldReturnEmptyList()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetByIdAsync_WhenServiceExists_ShouldReturnService()
        {
            // Arrange
            var serviceType = new ServiceType { serviceTypeId = Guid.NewGuid(), typeName = "General Checkup", description = "description" };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            var service = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceName = "Pet Checkup",
                serviceImage = "",
                serviceDescription = "",
                isDeleted = false,
                serviceTypeId = serviceType.serviceTypeId,
                ServiceType = serviceType
            };

            await _context.Service.AddAsync(service);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(service.serviceId);

            // Assert
            result.Should().NotBeNull();
            result.serviceId.Should().Be(service.serviceId);
            result.serviceName.Should().Be("Pet Checkup");
            result.ServiceType.Should().NotBeNull();
            result.ServiceType.typeName.Should().Be("General Checkup");
        }


        [Fact]
        public async Task GetByIdAsync_WhenServiceDoesNotExist_ShouldReturnNull()
        {
            // Act
            var result = await _repository.GetByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateAsync_WhenServiceExists_ShouldUpdateSuccessfully()
        {
            // Arrange
            var serviceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Grooming",
                description = "description"
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            var service = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = serviceType.serviceTypeId,
                serviceName = "Pet Wash",
                serviceImage = "old_image.jpg",
                serviceDescription = "Basic grooming service",
                isDeleted = false,
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow
            };
            await _context.Service.AddAsync(service);
            await _context.SaveChangesAsync();

            var updatedService = new Service
            {
                serviceId = service.serviceId,
                serviceTypeId = serviceType.serviceTypeId,
                serviceName = "Luxury Pet Wash",
                serviceDescription = "Premium grooming service",
                serviceImage = "image_url",
                isDeleted = false,
                updateAt = DateTime.UtcNow
            };

            // Act
            var result = await _repository.UpdateAsync(updatedService);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{updatedService.serviceId} is updated successfully");

            var retrievedService = await _repository.GetByIdAsync(updatedService.serviceId);
            retrievedService.serviceName.Should().Be("Luxury Pet Wash");
            retrievedService.serviceDescription.Should().Be("Premium grooming service");
            retrievedService.serviceImage.Should().Be("image_url");
        }


        public void Dispose()
        {
            _context.Dispose();

        }
    }
}
