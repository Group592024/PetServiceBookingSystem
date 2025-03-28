using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Presentation.Controllers;
using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace UnitTest.FacilityServiceApi.Controllers
{
    public class ServiceVariantControllerTest
    {
        private readonly IServiceVariant _serviceVariant;
        private readonly IService _service;
        private readonly IBookingServiceItem _booking;
        private readonly ServiceVariantController _controller;

        public ServiceVariantControllerTest()
        {
            _serviceVariant = A.Fake<IServiceVariant>();
            _service = A.Fake<IService>();
            _booking = A.Fake<IBookingServiceItem>();
            _controller = new ServiceVariantController(_serviceVariant, _service, _booking);
        }

        [Fact]
        public async Task GetServiceVariantsList_WhenServiceExists_ReturnsOkResponseWithData()
        {
            // Arrange
            var serviceId = Guid.NewGuid();
            var showAll = true;
            var service = new Service { serviceId = serviceId };
            var serviceVariants = new List<ServiceVariant>
    {
        new ServiceVariant { serviceVariantId = Guid.NewGuid(), serviceId = serviceId, serviceContent = "Variant 1" },
        new ServiceVariant { serviceVariantId = Guid.NewGuid(), serviceId = serviceId, serviceContent = "Variant 2" }
    };

            A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service?>(service));
            A.CallTo(() => _serviceVariant.GetAllVariantsAsync(serviceId)).Returns(Task.FromResult<IEnumerable<ServiceVariant>>(serviceVariants));

            var expectedDtos = serviceVariants.Select(v => new ServiceVariantDTO
            {
                serviceVariantId = v.serviceVariantId,
                serviceContent = v.serviceContent,
                serviceId = v.serviceId
            }).ToList();

            // Act
            var result = await _controller.GetServiceVariantListById(serviceId, showAll);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Service variants retrieved successfully");
            response.Data.Should().NotBeNull();
            response.Data.Should().BeEquivalentTo(expectedDtos);
        }



        [Fact]
        public async Task GetServiceVariantListById_WhenServiceDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var serviceId = Guid.NewGuid();
            A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service?>(null));

            // Act
            var result = await _controller.GetServiceVariantListById(serviceId, showAll: true);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be($"Service with GUID {serviceId} not found or is deleted");
        }

        [Fact]
        public async Task GetServiceVariantListById_WhenServiceVariantsDoNotExist_ReturnsNotFound()
        {
            // Arrange
            var serviceId = Guid.NewGuid();
            var service = new Service { serviceId = serviceId };

            A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service?>(service));
            A.CallTo(() => _serviceVariant.GetAllVariantsAsync(serviceId)).Returns(Task.FromResult<IEnumerable<ServiceVariant>>(new List<ServiceVariant>()));

            // Act
            var result = await _controller.GetServiceVariantListById(serviceId, showAll: true);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No service variants found in the database");
        }


        [Fact]
        public async Task GetServiceVariantById_WhenServiceVariantDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult<ServiceVariant?>(null));

            // Act
            var result = await _controller.GetServiceVariantById(serviceVariantId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be($"Service variant with GUID {serviceVariantId} not found or is deleted");
        }

        [Fact]
        public async Task GetServiceVariantById_WhenServiceVariantExists_ReturnsOkResponseWithData()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var serviceVariant = new ServiceVariant
            {
                serviceVariantId = serviceVariantId,
                serviceId = Guid.NewGuid(),
                serviceContent = "Sample Variant"
            };

            // Instead of mocking, directly call the real conversion method
            var (expectedDto, _) = ServiceVariantConversion.FromEntity(serviceVariant, null!);

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult<ServiceVariant?>(serviceVariant));

            // Act
            var result = await _controller.GetServiceVariantById(serviceVariantId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Service variant retrieved successfully");
            response.Data.Should().BeEquivalentTo(expectedDto);
        }



        [Fact]
        public async Task CreateServiceVariant_WhenValidInput_ReturnsOkResponse()
        {
            // Arrange
            var serviceVariantDto = new CreateServiceVariantDTO
            {
                serviceId = Guid.NewGuid(),
                serviceContent = "Valid Service Variant"
            };

            var service = new Service { serviceId = serviceVariantDto.serviceId };

            var expectedResponse = new Response(true, "Service variant created successfully");

            A.CallTo(() => _service.GetByIdAsync(serviceVariantDto.serviceId))
                .Returns(Task.FromResult<Service?>(service));

            A.CallTo(() => _serviceVariant.GetByAsync(A<Expression<Func<ServiceVariant, bool>>>._))
                .Returns(Task.FromResult<ServiceVariant?>(null));

            A.CallTo(() => _serviceVariant.CreateAsync(A<ServiceVariant>._))
                .Returns(Task.FromResult(expectedResponse));

            // Act
            _controller.ModelState.Clear();
            var result = await _controller.CreateServiceVariant(serviceVariantDto);

            // Assert
            result.Result.Should().NotBeNull();

            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Service variant created successfully");
        }

        [Fact]
        public async Task CreateServiceVariant_WhenModelStateInvalid_ReturnsBadRequest()
        {
            // Arrange
            _controller.ModelState.AddModelError("serviceContent", "Service content is required");

            var serviceVariantDto = new CreateServiceVariantDTO
            {
                serviceId = Guid.NewGuid(),
                serviceContent = ""
            };

            // Act
            var result = await _controller.CreateServiceVariant(serviceVariantDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Contain("Service content is required");
        }

        [Fact]
        public async Task CreateServiceVariant_WhenServiceDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var serviceVariantDto = new CreateServiceVariantDTO
            {
                serviceId = Guid.NewGuid(),
                serviceContent = "New Variant"
            };

            A.CallTo(() => _service.GetByIdAsync(serviceVariantDto.serviceId))
                .Returns(Task.FromResult<Service?>(null));

            // Act
            var result = await _controller.CreateServiceVariant(serviceVariantDto);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be($"Service with ID {serviceVariantDto.serviceId} not found");
        }

        [Fact]
        public async Task CreateServiceVariant_WhenServiceVariantAlreadyExists_ReturnsConflict()
        {
            // Arrange
            var serviceVariantDto = new CreateServiceVariantDTO
            {
                serviceId = Guid.NewGuid(),
                serviceContent = "Existing Variant"
            };

            var service = new Service { serviceId = serviceVariantDto.serviceId };
            var existingVariant = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = serviceVariantDto.serviceId,
                serviceContent = serviceVariantDto.serviceContent
            };

            A.CallTo(() => _service.GetByIdAsync(serviceVariantDto.serviceId))
                .Returns(Task.FromResult<Service?>(service));

            A.CallTo(() => _serviceVariant.GetByAsync(A<Expression<Func<ServiceVariant, bool>>>._))
                .Returns(Task.FromResult<ServiceVariant?>(existingVariant));

            // Act
            var result = await _controller.CreateServiceVariant(serviceVariantDto);

            // Assert
            var conflictResult = result.Result as ConflictObjectResult;
            conflictResult.Should().NotBeNull();
            conflictResult!.StatusCode.Should().Be(StatusCodes.Status409Conflict);

            var response = conflictResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be($"Service variant with content {existingVariant.serviceContent} is already existed");
        }

        [Fact]
        public async Task UpdateServiceVariant_WhenValidInput_ReturnsOkResponse()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var updateDto = new UpdateServiceVariantDTO
            {
                servicePrice = 100.0m,
                serviceContent = "Updated Service",
                isDeleted = false
            };

            var existingServiceVariant = new ServiceVariant
            {
                serviceVariantId = serviceVariantId,
                serviceId = Guid.NewGuid(),
                servicePrice = 80.0m,
                serviceContent = "Old Service",
                isDeleted = false,
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow
            };

            var updatedEntity = ServiceVariantConversion.ToEntity(updateDto);
            updatedEntity.serviceVariantId = serviceVariantId;
            updatedEntity.serviceId = existingServiceVariant.serviceId;
            updatedEntity.createAt = existingServiceVariant.createAt;
            updatedEntity.updateAt = DateTime.UtcNow;

            var expectedResponse = new Response(true, "Service variant updated successfully");

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult<ServiceVariant?>(existingServiceVariant));

            A.CallTo(() => _serviceVariant.UpdateAsync(A<ServiceVariant>._))
                .Returns(Task.FromResult(expectedResponse));

            // Act
            _controller.ModelState.Clear();
            var result = await _controller.UpdateServiceVariant(serviceVariantId, updateDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Service variant updated successfully");
        }

        [Fact]
        public async Task UpdateServiceVariant_WhenInvalidInput_ReturnsBadRequest()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var updateDto = new UpdateServiceVariantDTO
            {
                servicePrice = -10, // Invalid price
                serviceContent = "",
                isDeleted = false
            };

            _controller.ModelState.AddModelError("servicePrice", "Price must be positive.");
            _controller.ModelState.AddModelError("serviceContent", "Content is required.");

            // Act
            var result = await _controller.UpdateServiceVariant(serviceVariantId, updateDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Contain("Price must be positive");
            response.Message.Should().Contain("Content is required");
        }

        [Fact]
        public async Task UpdateServiceVariant_WhenServiceVariantNotFound_ReturnsNotFound()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var updateDto = new UpdateServiceVariantDTO
            {
                servicePrice = 100.0m,
                serviceContent = "Updated Service",
                isDeleted = false
            };

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult<ServiceVariant?>(null));

            // Act
            var result = await _controller.UpdateServiceVariant(serviceVariantId, updateDto);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be($"Service variant with ID {serviceVariantId} not found");
        }


        [Fact]
        public async Task DeleteServiceVariant_WhenNotFound_ReturnsNotFound()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult<ServiceVariant?>(null));

            // Act
            var result = await _controller.DeleteServiceVariant(serviceVariantId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be($"Service variant with ID {serviceVariantId} not found");
        }

        [Fact]
        public async Task DeleteServiceVariant_WhenSoftDeleteSuccessful_ReturnsOk()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var existingVariant = new ServiceVariant
            {
                serviceVariantId = serviceVariantId,
                isDeleted = false
            };

            var expectedResponse = new Response(true, "Soft delete successful");

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult(existingVariant));

            A.CallTo(() => _serviceVariant.DeleteAsync(existingVariant))
                .Returns(Task.FromResult(expectedResponse));

            // Act
            var result = await _controller.DeleteServiceVariant(serviceVariantId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Soft delete successful");
        }

        [Fact]
        public async Task DeleteServiceVariant_WhenHardDeleteSuccessful_ReturnsOk()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var existingVariant = new ServiceVariant
            {
                serviceVariantId = serviceVariantId,
                isDeleted = true
            };

            var expectedResponse = new Response(true, "Hard delete successful");

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult(existingVariant));

            A.CallTo(() => _booking.CheckIfVariantHasBooking(serviceVariantId))
                .Returns(Task.FromResult(false)); // No booking exists

            A.CallTo(() => _serviceVariant.DeleteSecondAsync(existingVariant))
                .Returns(Task.FromResult(expectedResponse));

            // Act
            var result = await _controller.DeleteServiceVariant(serviceVariantId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Hard delete successful");
        }

        [Fact]
        public async Task DeleteServiceVariant_WhenVariantHasBooking_ReturnsConflict()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var existingVariant = new ServiceVariant
            {
                serviceVariantId = serviceVariantId,
                isDeleted = true
            };

            A.CallTo(() => _serviceVariant.GetByIdAsync(serviceVariantId))
                .Returns(Task.FromResult(existingVariant));

            A.CallTo(() => _booking.CheckIfVariantHasBooking(serviceVariantId))
                .Returns(Task.FromResult(true));

            // Act
            var result = await _controller.DeleteServiceVariant(serviceVariantId);

            // Assert
            var conflictResult = result.Result as ConflictObjectResult;
            conflictResult.Should().NotBeNull();
            conflictResult!.StatusCode.Should().Be(StatusCodes.Status409Conflict);

            var response = conflictResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Can't delete this service variant because it is in at least booking.");
        }
    }
}
