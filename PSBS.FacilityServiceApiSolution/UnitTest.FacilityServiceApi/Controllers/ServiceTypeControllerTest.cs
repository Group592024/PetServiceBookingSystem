using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Presentation.Controllers;
using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.FacilityServiceApi.Controllers;
public class ServiceTypeControllerTests
{
    private readonly IServiceType _serviceTypeService;
    private readonly ServiceTypeController _controller;

    public ServiceTypeControllerTests()
    {
        _serviceTypeService = A.Fake<IServiceType>();
        _controller = new ServiceTypeController(_serviceTypeService);
    }

    [Fact]
    public async Task GetServiceTypes_WhenServiceTypesExist_ReturnsOkResponseWithData()
    {
        var serviceTypes = new List<ServiceType>
        {
            new ServiceType { serviceTypeId = Guid.NewGuid(), typeName = "Type 1" },
            new ServiceType { serviceTypeId = Guid.NewGuid(), typeName = "Type 2" }
        };

        var serviceTypeDTOs = serviceTypes.Select(st => new ServiceTypeDTO
        {
            serviceTypeId = st.serviceTypeId,
            typeName = st.typeName
        }).ToList();

        A.CallTo(() => _serviceTypeService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<ServiceType>>(serviceTypes));
        var result = await _controller.GetServiceTypes();

        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
    }

    [Fact]
    public async Task GetServiceTypes_WhenNoServiceTypesExist_ReturnsNotFound()
    {
        A.CallTo(() => _serviceTypeService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<ServiceType>>(new List<ServiceType>()));

        var result = await _controller.GetServiceTypes();

        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
    }

    [Fact]
    public async Task GetServiceTypeById_WhenServiceTypeExists_ReturnsOk()
    {
        var serviceTypeId = Guid.NewGuid();
        var serviceType = new ServiceType { serviceTypeId = serviceTypeId, typeName = "Type 1" };

        A.CallTo(() => _serviceTypeService.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult(serviceType));

        var result = await _controller.GetServiceTypeById(serviceTypeId);

        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
    }

    [Fact]
    public async Task GetServiceTypeById_WhenServiceTypeDoesNotExist_ReturnsNotFound()
    {
        var serviceTypeId = Guid.NewGuid();

        A.CallTo(() => _serviceTypeService.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult<ServiceType>(null));

        var result = await _controller.GetServiceTypeById(serviceTypeId);

        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
    }

    [Fact]
    public async Task CreateServiceType_ValidData_ReturnsOkResponse()
    {
        // Arrange
        var newServiceTypeDto = new ServiceTypeDTO { serviceTypeId = Guid.NewGuid(), typeName = "New Service", description = "Description" };
        var response = new Response(true, "Service type created successfully");

        A.CallTo(() => _serviceTypeService.CreateAsync(A<ServiceType>.Ignored)).Returns(Task.FromResult(response));

        // Act
        var result = await _controller.CreateServiceType(newServiceTypeDto);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
    }

    [Fact]
    public async Task CreateServiceType_InvalidData_ReturnsBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("typeName", "Required");

        // Act
        var result = await _controller.CreateServiceType(new ServiceTypeDTO());

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task UpdateServiceType_ValidData_ReturnsOkResponse()
    {
        // Arrange
        var updatingServiceTypeDto = new ServiceTypeDTO { serviceTypeId = Guid.NewGuid(), typeName = "Updated Service", description = "Updated Description" };
        var existingServiceType = new ServiceType { serviceTypeId = updatingServiceTypeDto.serviceTypeId, typeName = "Old Name" };
        var response = new Response(true, "Service type updated successfully");

        A.CallTo(() => _serviceTypeService.GetByIdAsync(updatingServiceTypeDto.serviceTypeId)).Returns(Task.FromResult(existingServiceType));
        A.CallTo(() => _serviceTypeService.UpdateAsync(A<ServiceType>.Ignored)).Returns(Task.FromResult(response));

        // Act
        var result = await _controller.UpdateServiceType(updatingServiceTypeDto);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
    }
    [Fact]
    public async Task UpdateServiceType_WhenInvalid_ReturnsBadRequest()
    {
        // Arrange
        var serviceTypeDto = new ServiceTypeDTO(); // Invalid DTO
        _controller.ModelState.AddModelError("typeName", "Type Name is required");

        // Act
        var result = await _controller.UpdateServiceType(serviceTypeDto);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task UpdateServiceType_NotFound_ReturnsNotFound()
    {
        // Arrange
        var updatingServiceTypeDto = new ServiceTypeDTO { serviceTypeId = Guid.NewGuid(), typeName = "Updated Service" };

        A.CallTo(() => _serviceTypeService.GetByIdAsync(updatingServiceTypeDto.serviceTypeId)).Returns(Task.FromResult<ServiceType>(null));

        // Act
        var result = await _controller.UpdateServiceType(updatingServiceTypeDto);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
    }

    [Fact]
    public async Task DeleteServiceType_SoftDelete_Success_ReturnsOk()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();
        var existingServiceType = new ServiceType { serviceTypeId = serviceTypeId , isDeleted = false};
        var response = new Response(true, "Service type soft deleted successfully");

        A.CallTo(() => _serviceTypeService.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult(existingServiceType));
        A.CallTo(() => _serviceTypeService.DeleteAsync(existingServiceType)).Returns(Task.FromResult(response));

        // Act
        var result = await _controller.DeleteServiceType(serviceTypeId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
    }

    [Fact]
    public async Task DeleteServiceType_HardDelete_Success_ReturnsOk()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();
        var existingServiceType = new ServiceType { serviceTypeId = serviceTypeId, isDeleted = true };
        var response = new Response(true, "Service type permanently deleted successfully");

        A.CallTo(() => _serviceTypeService.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult(existingServiceType));
        A.CallTo(() => _serviceTypeService.DeleteAsync(existingServiceType)).Returns(Task.FromResult(response));

        // Act
        var result = await _controller.DeleteServiceType(serviceTypeId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
    }

    [Fact]
    public async Task DeleteServiceType_WhenServiceFails_ReturnsBadRequest()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();
        var existingServiceType = new ServiceType { serviceTypeId = serviceTypeId, isDeleted = true };

        var failureResponse = new Response(false, "Cannot permanently delete ServiceType because there are linked services.");

        A.CallTo(() => _serviceTypeService.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult(existingServiceType));
        A.CallTo(() => _serviceTypeService.DeleteAsync(existingServiceType)).Returns(Task.FromResult(failureResponse));

        // Act
        var result = await _controller.DeleteServiceType(serviceTypeId);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("Cannot permanently delete");
    }

    [Fact]
    public async Task DeleteServiceType_NotFound_ReturnsNotFound()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();

        A.CallTo(() => _serviceTypeService.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult<ServiceType>(null));

        // Act
        var result = await _controller.DeleteServiceType(serviceTypeId);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
    }
}
