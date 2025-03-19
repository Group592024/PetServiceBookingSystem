using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FakeItEasy;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class ServiceTypeRepositoryTest
    {
        private readonly FacilityServiceDbContext _context;
        private readonly ServiceTypeRepository _repository;

        public ServiceTypeRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new ServiceTypeRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var serviceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Test Service Type",
                description = "Test description"
            };

            // Act
            var result = await _repository.CreateAsync(serviceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{serviceType.typeName} added successfully");
            result.Data.Should().BeOfType<ServiceType>();
            
            // Verify service type was added to database
            var savedServiceType = await _context.ServiceType.FindAsync(serviceType.serviceTypeId);
            savedServiceType.Should().NotBeNull();
            savedServiceType.typeName.Should().Be("Test Service Type");
            savedServiceType.isDeleted.Should().BeFalse();
            savedServiceType.createAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
            savedServiceType.updateAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task CreateAsync_WhenServiceTypeNameAlreadyExists_ReturnFailureResponse()
        {
            // Arrange
            var existingServiceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Duplicate Service Type Name",
                description = "Existing description",
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
            await _context.ServiceType.AddAsync(existingServiceType);
            await _context.SaveChangesAsync();

            var newServiceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "duplicate service type name", // Same name as existing service type (case insensitive)
                description = "New description"
            };

            // Act
            var result = await _repository.CreateAsync(newServiceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"ServiceType with Name {newServiceType.typeName} already exists!");
        }

        [Fact]
        public async Task DeleteAsync_WhenServiceTypeExistsWithNoRelatedServices_SoftDeleteSuccessfully()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Service Type to Delete",
                description = "Test description",
                isDeleted = false,
                createAt = DateTime.Now.AddDays(-1),
                updateAt = DateTime.Now.AddDays(-1)
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(serviceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("ServiceType and related services soft deleted successfully.");
            result.Data.Should().BeOfType<(ServiceTypeDTO, IEnumerable<ServiceTypeDTO>)>();

            // Verify service type was soft deleted
            var deletedServiceType = await _context.ServiceType.FindAsync(serviceTypeId);
            deletedServiceType.Should().NotBeNull();
            deletedServiceType.isDeleted.Should().BeTrue();
            deletedServiceType.updateAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task DeleteAsync_WhenServiceTypeExistsWithRelatedServices_SoftDeleteServiceTypeAndServices()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Service Type with Services",
                description = "Test description",
                isDeleted = false,
                createAt = DateTime.Now.AddDays(-1),
                updateAt = DateTime.Now.AddDays(-1)
            };
            await _context.ServiceType.AddAsync(serviceType);

            var relatedServices = new List<Service>
            {
                new Service
                {
                    serviceId = Guid.NewGuid(),
                    serviceName = "Related Service 1",
                    serviceTypeId = serviceTypeId,
                    isDeleted = false,
                    serviceDescription = "Description",
                    serviceImage = "service.jpg",
                    createAt = DateTime.Now.AddDays(-1),
                    updateAt = DateTime.Now.AddDays(-1)
                },
                new Service
                {
                    serviceId = Guid.NewGuid(),
                    serviceName = "Related Service 2",
                    serviceTypeId = serviceTypeId,
                    isDeleted = false,
                    serviceDescription = "Description",
                    serviceImage = "service.jpg",
                    createAt = DateTime.Now.AddDays(-1),
                    updateAt = DateTime.Now.AddDays(-1)
                }
            };
            await _context.Service.AddRangeAsync(relatedServices);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(serviceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("ServiceType and related services soft deleted successfully.");
            
            // Verify service type was soft deleted
            var deletedServiceType = await _context.ServiceType.FindAsync(serviceTypeId);
            deletedServiceType.Should().NotBeNull();
            deletedServiceType.isDeleted.Should().BeTrue();
            deletedServiceType.updateAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
            
            // Verify related services were soft deleted
            var services = await _context.Service.Where(s => s.serviceTypeId == serviceTypeId).ToListAsync();
            services.Should().HaveCount(2);
            services.All(s => s.isDeleted).Should().BeTrue();
            services.All(s => s.updateAt > s.createAt).Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_WhenServiceTypeAlreadySoftDeletedWithNoRelatedServices_PermanentlyDelete()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Soft Deleted Service Type",
                description = "Test description",
                isDeleted = true, // Already soft deleted
                createAt = DateTime.Now.AddDays(-1),
                updateAt = DateTime.Now.AddDays(-1)
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(serviceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"ServiceType with Name {serviceType.typeName} has been permanently deleted.");
            
            // Verify service type was permanently deleted
            var deletedServiceType = await _context.ServiceType.FindAsync(serviceTypeId);
            deletedServiceType.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_WhenServiceTypeAlreadySoftDeletedWithRelatedServices_PreventPermanentDeletion()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Soft Deleted Service Type with Services",
                description = "Test description",
                isDeleted = true, // Already soft deleted
                createAt = DateTime.Now.AddDays(-1),
                updateAt = DateTime.Now.AddDays(-1)
            };
            await _context.ServiceType.AddAsync(serviceType);

            var relatedService = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceName = "Related Service",
                serviceTypeId = serviceTypeId,
                isDeleted = true,
                serviceDescription = "Description",
                serviceImage = "service.jpg",
                createAt = DateTime.Now.AddDays(-1),
                updateAt = DateTime.Now.AddDays(-1)
            };
            await _context.Service.AddAsync(relatedService);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(serviceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Cannot delete ServiceType with Name {serviceType.typeName} because it is still in use by related services.");
            
            // Verify service type still exists
            var existingServiceType = await _context.ServiceType.FindAsync(serviceTypeId);
            existingServiceType.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteAsync_WhenServiceTypeDoesNotExist_ReturnFailureResponse()
        {
            // Arrange
            var nonExistentServiceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Non-existent Service Type"
            };

            // Act
            var result = await _repository.DeleteAsync(nonExistentServiceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("ServiceType not found.");
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllServiceTypes()
        {
            // Arrange
            var serviceTypes = new List<ServiceType>
            {
                new ServiceType
                {
                    serviceTypeId = Guid.NewGuid(),
                    typeName = "Service Type 1",
                    description = "Description 1",
                    isDeleted = false,
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                },
                new ServiceType
                {
                    serviceTypeId = Guid.NewGuid(),
                    typeName = "Service Type 2",
                    description = "Description 2",
                    isDeleted = false,
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                },
                new ServiceType
                {
                    serviceTypeId = Guid.NewGuid(),
                    typeName = "Service Type 3",
                    description = "Description 3",
                    isDeleted = true,
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                }
            };

            await _context.ServiceType.AddRangeAsync(serviceTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3);
            result.Should().ContainEquivalentOf(serviceTypes[0]);
            result.Should().ContainEquivalentOf(serviceTypes[1]);
            result.Should().ContainEquivalentOf(serviceTypes[2]);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsEmptyList_WhenNoServiceTypesExist()
        {
            // Arrange

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty(); 
        }

        [Fact]
        public async Task GetAllAsync_IncludesServicesInResult()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Service Type with Services",
                description = "Test description",
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
            await _context.ServiceType.AddAsync(serviceType);

            var services = new List<Service>
            {
                new Service
                {
                    serviceId = Guid.NewGuid(),
                    serviceName = "Service 1",
                    serviceTypeId = serviceTypeId,
                    isDeleted = false,
                    serviceDescription = "Description",
                    serviceImage = "service.jpg",
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                },
                new Service
                {
                    serviceId = Guid.NewGuid(),
                    serviceName = "Service 2",
                    serviceTypeId = serviceTypeId,
                    isDeleted = false,
                    serviceDescription = "Description",
                    serviceImage = "service.jpg",
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                }
            };
            await _context.Service.AddRangeAsync(services);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);

            var retrievedServiceType = result.First();
            retrievedServiceType.typeName.Should().Be("Service Type with Services");
            retrievedServiceType.Services.Should().NotBeNull();
            retrievedServiceType.Services.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetByIdAsync_WhenServiceTypeExists_ReturnServiceType()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Test Service Type",
                description = "Test description",
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(serviceTypeId);

            // Assert
            result.Should().NotBeNull();
            result.serviceTypeId.Should().Be(serviceTypeId);
            result.typeName.Should().Be("Test Service Type");
        }

        [Fact]
        public async Task GetByIdAsync_WhenServiceTypeDoesNotExist_ReturnNull()
        {
            // Arrange
            var nonExistentServiceTypeId = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(nonExistentServiceTypeId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByAsync_WhenServiceTypeExists_ReturnServiceType()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Test Service Type",
                description = "Test description",
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(st => st.serviceTypeId == serviceTypeId);

            // Assert
            result.Should().NotBeNull();
            result.serviceTypeId.Should().Be(serviceTypeId);
            result.typeName.Should().Be("Test Service Type");
        }

        [Fact]
        public async Task GetByAsync_WhenServiceTypeDoesNotExist_ThrowsException()
        {
            // Arrange
            var nonExistentServiceTypeId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _repository.GetByAsync(st => st.serviceTypeId == nonExistentServiceTypeId));
        }

        [Fact]
        public async Task UpdateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Original Service Type",
                description = "Original description",
                isDeleted = false,
                createAt = DateTime.Now.AddDays(-1),
                updateAt = DateTime.Now.AddDays(-1)
            };
            await _context.ServiceType.AddAsync(serviceType);
            await _context.SaveChangesAsync();

            var updatedServiceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Updated Service Type",
                description = "Updated description",
                isDeleted = false
            };

            // Act
            var result = await _repository.UpdateAsync(updatedServiceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{updatedServiceType.typeName} updated successfully");
            result.Data.Should().BeOfType<ServiceTypeDTO>();
            
            // Verify service type was updated in database
            var savedServiceType = await _context.ServiceType.FindAsync(serviceTypeId);
            savedServiceType.Should().NotBeNull();
            savedServiceType.typeName.Should().Be("Updated Service Type");
            savedServiceType.description.Should().Be("Updated description");
            savedServiceType.updateAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
            savedServiceType.createAt.Should().BeCloseTo(DateTime.Now.AddDays(-1), TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task UpdateAsync_WhenServiceTypeDoesNotExist_ReturnFailureResponse()
        {
            // Arrange
            var nonExistentServiceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Non-existent Service Type",
                description = "Test description"
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentServiceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"ServiceType with ID {nonExistentServiceType.serviceTypeId} not found or already deleted");
        }

        [Fact]
        public async Task UpdateAsync_WhenDuplicateServiceTypeName_ReturnFailureResponse()
        {
            // Arrange
            // First service type
            var serviceType1 = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Existing Service Type",
                description = "Existing description",
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
            
            // Second service type to be updated
            var serviceType2Id = Guid.NewGuid();
            var serviceType2 = new ServiceType
            {
                serviceTypeId = serviceType2Id,
                typeName = "Service Type to Update",
                description = "Original description",
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
            
            await _context.ServiceType.AddRangeAsync(serviceType1, serviceType2);
            await _context.SaveChangesAsync();

            var updatedServiceType = new ServiceType
            {
                serviceTypeId = serviceType2Id,
                typeName = "existing service type", // Trying to update to a name that already exists (case insensitive)
                description = "Updated description",
                isDeleted = false
            };

            // Act
            var result = await _repository.UpdateAsync(updatedServiceType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"ServiceType with Name {updatedServiceType.typeName} already exists!");
        }

        [Fact]
        public async Task ListAvailableServiceTypeAsync_ReturnsOnlyNonDeletedServiceTypes()
        {
            // Arrange
            var serviceTypes = new List<ServiceType>
            {
                new ServiceType
                {
                    serviceTypeId = Guid.NewGuid(),
                    typeName = "Available Service Type 1",
                    description = "Description 1",
                    isDeleted = false,
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                },
                new ServiceType
                {
                    serviceTypeId = Guid.NewGuid(),
                    typeName = "Available Service Type 2",
                    description = "Description 2",
                    isDeleted = false,
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                },
                new ServiceType
                {
                    serviceTypeId = Guid.NewGuid(),
                    typeName = "Deleted Service Type",
                    description = "Description 3",
                    isDeleted = true,
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                }
            };

            await _context.ServiceType.AddRangeAsync(serviceTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailableServiceTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(st => st.typeName == "Available Service Type 1");
            result.Should().Contain(st => st.typeName == "Available Service Type 2");
            result.Should().NotContain(st => st.typeName == "Deleted Service Type");
        }
        
        [Fact]
        public async Task ListAvailableServiceTypeAsync_ReturnsEmptyList_WhenNoServiceTypesExist()
        {
            // Arrange

            // Act
            var result = await _repository.ListAvailableServiceTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty(); 
        }

        [Fact]
        public async Task ListAvailableServiceTypeAsync_IncludesServicesInResult()
        {
            // Arrange
            var serviceTypeId = Guid.NewGuid();
            var serviceType = new ServiceType
            {
                serviceTypeId = serviceTypeId,
                typeName = "Service Type with Services",
                description = "Test description",
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
            await _context.ServiceType.AddAsync(serviceType);

            var services = new List<Service>
            {
                new Service
                {
                    serviceId = Guid.NewGuid(),
                    serviceName = "Service 1",
                    serviceTypeId = serviceTypeId,
                    isDeleted = false,
                    serviceDescription = "Description",
                    serviceImage = "service.jpg",
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                },
                new Service
                {
                    serviceId = Guid.NewGuid(),
                    serviceName = "Service 2",
                    serviceTypeId = serviceTypeId,
                    isDeleted = false,
                    serviceDescription = "Description",
                    serviceImage = "service.jpg",
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now
                }
            };
            await _context.Service.AddRangeAsync(services);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailableServiceTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            
            var retrievedServiceType = result.First();
            retrievedServiceType.typeName.Should().Be("Service Type with Services");
            retrievedServiceType.Services.Should().NotBeNull();
            retrievedServiceType.Services.Should().HaveCount(2);
        }

    }
}
