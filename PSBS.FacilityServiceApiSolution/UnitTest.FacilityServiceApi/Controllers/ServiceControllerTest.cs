using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Presentation.Controllers;
using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using Quartz;

namespace UnitTest.FacilityServiceApi.Controllers;
public class ServiceControllerTest
{
    private readonly IService _service;
    private readonly IServiceType _serviceType;
    private readonly IServiceVariant _serviceVariant;
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly ServiceController _controller;

    public ServiceControllerTest()
    {
        _service = A.Fake<IService>();
        _serviceType = A.Fake<IServiceType>();
        _serviceVariant = A.Fake<IServiceVariant>();
        _schedulerFactory = A.Fake<ISchedulerFactory>();
        _controller = new ServiceController(_service, _serviceType, _serviceVariant, _schedulerFactory);
    }

    [Fact]
    public async Task GetServicesList_WhenServicesExist_ReturnsOkResponseWithData()
    {
        // Arrange
        var serviceType1 = new ServiceType
        {
            serviceTypeId = Guid.NewGuid(),
            typeName = "Type 1",
            description = "Description 1",
            isDeleted = false
        };

        var serviceType2 = new ServiceType
        {
            serviceTypeId = Guid.NewGuid(),
            typeName = "Type 2",
            description = "Description 2",
            isDeleted = false
        };

        var services = new List<Service>
    {
        new Service
        {
            serviceId = Guid.NewGuid(),
            serviceName = "Service 1",
            serviceTypeId = serviceType1.serviceTypeId,
            isDeleted = false,
            ServiceType = serviceType1
        },
        new Service
        {
            serviceId = Guid.NewGuid(),
            serviceName = "Service 2",
            serviceTypeId = serviceType2.serviceTypeId,
            isDeleted = false,
            ServiceType = serviceType2
        }
    };

        var serviceDTOs = services.Select(s => new ServiceDTO
        {
            serviceId = s.serviceId,
            serviceName = s.serviceName,
            serviceTypeId = s.serviceTypeId,
            ServiceType = new ServiceType
            {
                serviceTypeId = s.serviceTypeId,
                typeName = s.ServiceType.typeName,
                description = s.ServiceType.description,
                createAt = s.ServiceType.createAt,
                updateAt = s.ServiceType.updateAt,
                isDeleted = s.ServiceType.isDeleted
            }
        }).ToList();


        A.CallTo(() => _service.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Service>>(services));


        // Act
        var result = await _controller.GetServicesList(true);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Services retrieved successfully");
        response.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetServicesList_WhenNoServicesExist_ReturnsNotFound()
    {
        // Arrange
        A.CallTo(() => _service.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Service>>(new List<Service>()));

        // Act
        var result = await _controller.GetServicesList(true);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("No services found in the database");
    }

    [Fact]
    public async Task GetServiceById_WhenServiceExists_ReturnsOkResponse()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var serviceType = new ServiceType
        {
            serviceTypeId = Guid.NewGuid(),
            typeName = "Type 1",
            description = "Description 1",
            isDeleted = false
        };
        var service = new Service
        {
            serviceId = serviceId,
            serviceName = "Service 1",
            serviceTypeId = serviceType.serviceTypeId,
            isDeleted = false,
            ServiceType = serviceType

        };

        var serviceDTO = new ServiceDTO
        {
            serviceId = serviceId,
            serviceName = "Service 1",
            serviceTypeId = serviceType.serviceTypeId
        };

        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult(service));

        // Act
        var result = await _controller.GetServiceById(serviceId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Service retrieved successfully");

        var returnedDto = response.Data as ServiceDTO;
        returnedDto.Should().NotBeNull();
        returnedDto!.serviceId.Should().Be(serviceId);
    }

    [Fact]
    public async Task GetServiceById_WhenServiceDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service>(null));

        // Act
        var result = await _controller.GetServiceById(serviceId);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain(serviceId.ToString());
    }

    [Fact]
    public async Task CreateService_WithAllValidInput_ReturnsOkResponse()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();
        var newServiceDto = new CreateServiceDTO
        {
            serviceName = "Service 1",
            serviceTypeId = serviceTypeId,
        };

        var serviceType = new ServiceType
        {
            serviceTypeId = serviceTypeId,
            typeName = "Medical service"
        };

        var newService = new Service
        {
            serviceName = "Service 1",
            serviceTypeId = serviceTypeId,
            serviceDescription = "A nice service",
            serviceImage = "/Images/some-guid.jpg"
        };

        var successResponse = new Response(true, "Service created successfully")
        {
            Data = newService
        };

        var mockFormFile = A.Fake<IFormFile>();
        A.CallTo(() => mockFormFile.Length).Returns(1024);
        A.CallTo(() => mockFormFile.FileName).Returns("test-image.jpg");
        A.CallTo(() => mockFormFile.OpenReadStream()).Returns(new MemoryStream(new byte[1024]));
        A.CallTo(() => mockFormFile.ContentType).Returns("image/jpeg");

        A.CallTo(() => _serviceType.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult(serviceType));
        A.CallTo(() => _service.CreateAsync(A<Service>.Ignored)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.CreateService(newServiceDto, mockFormFile);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var returnedResponse = okResult.Value as Response;
        returnedResponse.Should().NotBeNull();
        returnedResponse!.Flag.Should().BeTrue();
        returnedResponse.Message.Should().Be("Service created successfully");
    }

    [Fact]
    public async Task CreateService_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();
        _controller.ModelState.AddModelError("serviceName", "Service name is required");
        var newServiceDto = new CreateServiceDTO { serviceName = "", serviceTypeId = serviceTypeId };
        var mockFormFile = A.Fake<IFormFile>();
        A.CallTo(() => mockFormFile.Length).Returns(1024);
        A.CallTo(() => mockFormFile.FileName).Returns("test-image.jpg");
        A.CallTo(() => mockFormFile.OpenReadStream()).Returns(new MemoryStream(new byte[1024]));
        A.CallTo(() => mockFormFile.ContentType).Returns("image/jpeg");

        // Act
        var result = await _controller.CreateService(newServiceDto, mockFormFile);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("Service name is required");

    }

    [Fact]
    public async Task CreateService_WithNonExistentServiceType_ReturnsNotFound()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();
        var newServiceDto = new CreateServiceDTO
        {
            serviceName = "Service 1",
            serviceTypeId = serviceTypeId,
        };

        A.CallTo(() => _serviceType.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult<ServiceType>(null));
        var mockFormFile = A.Fake<IFormFile>();
        A.CallTo(() => mockFormFile.Length).Returns(1024);

        // Act
        var result = await _controller.CreateService(newServiceDto, mockFormFile);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain(serviceTypeId.ToString());
    }

    [Fact]
    public async Task CreateService_WhenInvalidImage_ReturnsBadRequest()
    {
        // Arrange
        var serviceTypeId = Guid.NewGuid();
        var newServiceDto = new CreateServiceDTO
        {
            serviceName = "Service 1",
            serviceTypeId = serviceTypeId,
        };

        var mockImageFile = A.Fake<IFormFile>();
        A.CallTo(() => mockImageFile.Length).Returns(0);
        A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");

        // Act
        var result = await _controller.CreateService(newServiceDto, mockImageFile);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("The uploaded file failed");
    }


    [Fact]
    public async Task UpdateService_WithAllValidInput_ReturnsOkResponse()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var serviceTypeId = Guid.NewGuid();

        var existingService = new Service
        {
            serviceId = serviceId,
            serviceName = "Service 1",
            serviceTypeId = serviceTypeId,
            serviceImage = "/Images/old-image.jpg"
        };

        var updatedService = new UpdateServiceDTO
        {
            serviceName = "Service update",
            serviceTypeId = serviceTypeId,
        };

        var successResponse = new Response(true, "Service updated successfully");

        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service?>(existingService));
        A.CallTo(() => _service.UpdateAsync(A<Service>.Ignored)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.UpdateService(serviceId, updatedService, null);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var returnedResponse = okResult.Value as Response;
        returnedResponse.Should().NotBeNull();
        returnedResponse!.Flag.Should().BeTrue();
        returnedResponse.Message.Should().Be("Service updated successfully");
    }

    [Fact]
    public async Task UpdateService_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("serviceTypeId", "Service type ID is required");
        var updatingServiceDto = new UpdateServiceDTO { serviceName = "Service 1" };

        var serviceId = Guid.NewGuid();

        // Act
        var result = await _controller.UpdateService(serviceId, updatingServiceDto, null);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("Service type ID is required");
    }

    [Fact]
    public async Task UpdateService_WhenServiceDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var updateDto = new UpdateServiceDTO
        {
            serviceName = "Updated Service",
            serviceTypeId = Guid.NewGuid()
        };

        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service>(null));

        // Act
        var result = await _controller.UpdateService(serviceId, updateDto);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("not found");
    }


    [Fact]
    public async Task DeleteService_WhenServiceDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service>(null));

        // Act
        var result = await _controller.DeleteService(serviceId);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
    }

    [Fact]
    public async Task DeleteService_WhenSoftDeleteIsSuccessful_ReturnsOk()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var existingService = new Service
        {
            serviceId = serviceId,
            serviceName = "Service to Soft Delete",
            isDeleted = false
        };

        var successResponse = new Response(true, "Service soft deleted successfully");

        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
        A.CallTo(() => _service.DeleteAsync(existingService)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.DeleteService(serviceId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().Be(successResponse);
    }

    [Fact]
    public async Task DeleteService_WhenHardDeleteIsSuccessful_ReturnsOk()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var existingService = new Service
        {
            serviceId = serviceId,
            serviceName = "Service to Hard Delete",
            isDeleted = true
        };

        var successResponse = new Response(true, "Service permanently deleted");

        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
        A.CallTo(() => _service.DeleteSecondAsync(existingService)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.DeleteService(serviceId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().Be(successResponse);
    }

    [Fact]
    public async Task DeleteService_WhenServiceHasVariants_ReturnsBadRequest()
    {
        // Arrange
        var serviceId = Guid.NewGuid();
        var existingService = new Service
        {
            serviceId = serviceId,
            serviceName = "Service with Variants",
            isDeleted = true
        };

        var failResponse = new Response(false, "Cannot delete service because it has variants");

        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
        A.CallTo(() => _service.DeleteSecondAsync(existingService)).Returns(Task.FromResult(failResponse));

        // Act
        var result = await _controller.DeleteService(serviceId);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("Cannot delete service because it has variants");
    }

}
