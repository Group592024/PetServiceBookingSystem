//using FacilityServiceApi.Application.DTOs;
//using FacilityServiceApi.Application.Interfaces;
//using FacilityServiceApi.Domain.Entities;
//using FacilityServiceApi.Presentation.Controllers;
//using FakeItEasy;
//using FluentAssertions;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using PSPS.SharedLibrary.Responses;
//using Quartz;

//namespace UnitTest.FacilityServiceApi.Controllers;
//public class ServiceControllerTest
//{
//    private readonly IService _service;
//    private readonly IServiceType _serviceType;
//    private readonly IServiceVariant _serviceVariant;
//    private readonly ISchedulerFactory _schedulerFactory;
//    private readonly ServiceController _controller;

//    public ServiceControllerTest()
//    {
//        _service = A.Fake<IService>();
//        _serviceType = A.Fake<IServiceType>();
//        _serviceVariant = A.Fake<IServiceVariant>();
//        _schedulerFactory = A.Fake<ISchedulerFactory>();
//        _controller = new ServiceController(_service, _serviceType, _serviceVariant, _schedulerFactory);
//    }

//    [Fact]
//    public async Task GetServicesList_WhenServicesExist_ReturnsOkResponseWithData()
//    {
//        // Arrange
//        var services = new List<Service>
//        {
//            new Service { serviceId = Guid.NewGuid(), serviceName = "Service 1", serviceTypeId = Guid.NewGuid(), isDeleted = false },
//            new Service { serviceId = Guid.NewGuid(), serviceName = "Service 2", serviceTypeId = Guid.NewGuid(), isDeleted = false }
//        };

//        var serviceDTOs = new List<ServiceDTO>
//        {
//            new ServiceDTO { serviceId = services[0].serviceId, serviceName = services[0].serviceName, serviceTypeId = services[0].serviceTypeId },
//            new ServiceDTO { serviceId = services[1].serviceId, serviceName = services[1].serviceName, serviceTypeId = services[1].serviceTypeId }
//        };

//        A.CallTo(() => _service.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Service>>(services));

//        // Act
//        var result = await _controller.GetServicesList(true);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var response = okResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeTrue();
//        response.Message.Should().Be("Services retrieved successfully");
//        response.Data.Should().NotBeNull();
//    }

//    [Fact]
//    public async Task GetServicesList_WhenNoServicesExist_ReturnsNotFound()
//    {
//        // Arrange
//        A.CallTo(() => _service.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Service>>(new List<Service>()));

//        // Act
//        var result = await _controller.GetServicesList(true);

//        // Assert
//        var notFoundResult = result.Result as NotFoundObjectResult;
//        notFoundResult.Should().NotBeNull();
//        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

//        var response = notFoundResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Be("No services found in the database");
//    }

//    [Fact]
//    public async Task GetServiceById_WhenServiceExists_ReturnsOkResponse()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var service = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 1",
//            serviceTypeId = Guid.NewGuid(),
//            isDeleted = false
//        };

//        var serviceDTO = new ServiceDTO
//        {
//            serviceId = serviceId,
//            serviceName = "Service 1",
//            serviceTypeId = service.serviceTypeId
//        };

//        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult(service));

//        // Act
//        var result = await _controller.GetServiceById(serviceId);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var response = okResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeTrue();
//        response.Message.Should().Be("Service retrieved successfully");

//        var returnedDto = response.Data as ServiceDTO;
//        returnedDto.Should().NotBeNull();
//        returnedDto!.serviceId.Should().Be(serviceId);
//    }

//    [Fact]
//    public async Task GetServiceById_WhenServiceDoesNotExist_ReturnsNotFound()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        A.CallTo(() => _service.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service>(null));

//        // Act
//        var result = await _controller.GetServiceById(serviceId);

//        // Assert
//        var notFoundResult = result.Result as NotFoundObjectResult;
//        notFoundResult.Should().NotBeNull();
//        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

//        var response = notFoundResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Contain(serviceId.ToString());
//    }

//    [Fact]
//    public async Task CreateService_WithAllValidInput_ReturnsOkResponse()
//    {
//        // Arrange
//        var serviceTypeId = Guid.NewGuid();
//        var newServiceDto = new CreateServiceDTO
//        {
//            serviceName = "Service 1",
//            serviceTypeId = serviceTypeId,
//        };

//        var serviceType = new ServiceType
//        {
//            serviceTypeId = serviceTypeId,
//            typeName = "Medical service"
//        };

//        var newService = new Service
//        {
//            serviceName = "Service 1",
//            serviceTypeId = serviceTypeId,
//            serviceDescription = "A nice service",
//            serviceImage = "/Images/some-guid.jpg"
//        };

//        var successResponse = new Response(true, "Service created successfully")
//        {
//            Data = newService
//        };

//        var mockFormFile = A.Fake<IFormFile>();
//        A.CallTo(() => mockFormFile.Length).Returns(1024);

//        A.CallTo(() => _serviceType.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult(serviceType));
//        A.CallTo(() => _service.CreateAsync(A<Service>.Ignored)).Returns(Task.FromResult(successResponse));

//        // Act
//        var result = await _controller.CreateService(newServiceDto, mockFormFile);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var returnedResponse = okResult.Value as Response;
//        returnedResponse.Should().NotBeNull();
//        returnedResponse!.Flag.Should().BeTrue();
//        returnedResponse.Message.Should().Be("Service created successfully");
//    }

//    [Fact]
//    public async Task CreateService_WithInvalidData_ReturnsBadRequest()
//    {
//        // Arrange
//        _controller.ModelState.AddModelError("serviceTypeId", "Service type ID is required");
//        var newServiceDto = new CreateServiceDTO { serviceName = "Service 1" };
//        var mockFormFile = A.Fake<IFormFile>();
//        A.CallTo(() => mockFormFile.Length).Returns(1024);

//        // Act
//        var result = await _controller.CreateService(newServiceDto, mockFormFile);

//        // Assert
//        var badRequestResult = result.Result as BadRequestObjectResult;
//        badRequestResult.Should().NotBeNull();
//        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

//        var response = badRequestResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Be("Invalid input");
//    }

//    [Fact]
//    public async Task CreateService_WithNonExistentServiceType_ReturnsNotFound()
//    {
//        // Arrange
//        var serviceTypeId = Guid.NewGuid();
//        var newServiceDto = new CreateServiceDTO
//        {
//            serviceName = "Service 1",
//            serviceTypeId = serviceTypeId,
//        };

//        A.CallTo(() => _serviceType.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult<ServiceType>(null));
//        var mockFormFile = A.Fake<IFormFile>();
//        A.CallTo(() => mockFormFile.Length).Returns(1024);

//        // Act
//        var result = await _controller.CreateService(newServiceDto, mockFormFile);

//        // Assert
//        var notFoundResult = result.Result as NotFoundObjectResult;
//        notFoundResult.Should().NotBeNull();
//        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

//        var response = notFoundResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Contain(serviceTypeId.ToString());
//    }

//    [Fact]
//    public async Task CreatePetType_WhenInvalidImage_ReturnsBadRequest()
//    {
//        // Arrange
//        var serviceTypeId = Guid.NewGuid();
//        var newServiceDto = new CreateServiceDTO
//        {
//            serviceName = "Service 1",
//            serviceTypeId = serviceTypeId,
//        };

//        var mockImageFile = A.Fake<IFormFile>();
//        A.CallTo(() => mockImageFile.Length).Returns(0);
//        A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");

//        // Act
//        var result = await _controller.CreatePetType(petTypeDto, mockImageFile);

//        // Assert
//        var badRequestResult = result.Result as BadRequestObjectResult;
//        badRequestResult.Should().NotBeNull();
//        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
//        var response = badRequestResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Be("The uploaded file failed");
//    }


//    [Fact]
//    public async Task UpdateService_WithValidData_ReturnsOkResponse()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var serviceTypeId = Guid.NewGuid();
//        var updatingServiceDto = new ServiceDTO
//        {
//            serviceId = serviceId,
//            serviceName = "Service 104",
//            serviceTypeId = serviceTypeId,
//            description = "Updated description"
//        };

//        var existingService = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 103",
//            serviceTypeId = serviceTypeId,
//            description = "Original description",
//            serviceImage = "/Images/old-image.jpg"
//        };

//        var updatedService = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 104",
//            serviceTypeId = serviceTypeId,
//            description = "Updated description",
//            serviceImage = "/Images/old-image.jpg"
//        };

//        var successResponse = new Response(true, "Service updated successfully")
//        {
//            Data = updatedService
//        };

//        A.CallTo(() => _serviceService.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
//        A.CallTo(() => _serviceService.UpdateAsync(A<Service>.Ignored)).Returns(Task.FromResult(successResponse));

//        // Act
//        var result = await _controller.UpdateService(updatingServiceDto, null);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var returnedResponse = okResult.Value as Response;
//        returnedResponse.Should().NotBeNull();
//        returnedResponse!.Flag.Should().BeTrue();
//        returnedResponse.Message.Should().Be("Service updated successfully");
//    }

//    [Fact]
//    public async Task UpdateService_WithInvalidData_ReturnsBadRequest()
//    {
//        // Arrange
//        _controller.ModelState.AddModelError("serviceTypeId", "Service type ID is required");
//        var updatingServiceDto = new ServiceDTO { serviceId = Guid.NewGuid(), serviceName = "Service 104" };

//        // Act
//        var result = await _controller.UpdateService(updatingServiceDto, null);

//        // Assert
//        var badRequestResult = result.Result as BadRequestObjectResult;
//        badRequestResult.Should().NotBeNull();
//        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

//        var response = badRequestResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Be("Invalid input");
//    }

//    [Fact]
//    public async Task UpdateService_WhenServiceDoesNotExist_ReturnsNotFound()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var updatingServiceDto = new ServiceDTO
//        {
//            serviceId = serviceId,
//            serviceName = "Service 104",
//            serviceTypeId = Guid.NewGuid(),
//            description = "Updated description"
//        };

//        A.CallTo(() => _serviceService.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service>(null));

//        // Act
//        var result = await _controller.UpdateService(updatingServiceDto, null);

//        // Assert
//        var notFoundResult = result.Result as NotFoundObjectResult;
//        notFoundResult.Should().NotBeNull();
//        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

//        var response = notFoundResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Contain(serviceId.ToString());
//    }

//    [Fact]
//    public async Task SoftDeleteService_WhenServiceExists_ReturnsOkResponse()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var existingService = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 101",
//            serviceTypeId = Guid.NewGuid(),
//            isDeleted = false
//        };

//        var successResponse = new Response(true, "Service soft deleted successfully");

//        A.CallTo(() => _serviceService.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
//        A.CallTo(() => _serviceService.DeleteAsync(existingService)).Returns(Task.FromResult(successResponse));

//        // Act
//        var result = await _controller.DeleteService(serviceId);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var response = okResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeTrue();
//    }
//    [Fact]
//    public async Task HardDeleteService_WhenServiceExists_ReturnsOkResponse()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var existingService = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 101",
//            serviceTypeId = Guid.NewGuid(),
//            isDeleted = false
//        };

//        var successResponse = new Response(true, "Service hard deleted successfully");

//        A.CallTo(() => _serviceService.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
//        A.CallTo(() => _serviceService.DeleteAsync(existingService)).Returns(Task.FromResult(successResponse));

//        // Act
//        var result = await _controller.DeleteService(serviceId);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var response = okResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeTrue();
//    }

//    [Fact]
//    public async Task DeleteService_WhenServiceDoesNotExist_ReturnsNotFound()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        A.CallTo(() => _serviceService.GetByIdAsync(serviceId)).Returns(Task.FromResult<Service>(null));

//        // Act
//        var result = await _controller.DeleteService(serviceId);

//        // Assert
//        var notFoundResult = result.Result as NotFoundObjectResult;
//        notFoundResult.Should().NotBeNull();
//        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

//        var response = notFoundResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Contain("not found or already deleted");
//    }

//    [Fact]
//    public async Task DeleteService_WhenServiceFails_ReturnsBadRequest()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var existingService = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 101",
//            serviceTypeId = Guid.NewGuid(),
//            isDeleted = false
//        };

//        var failureResponse = new Response(false, "Cannot delete service because it has active bookings");

//        A.CallTo(() => _serviceService.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
//        A.CallTo(() => _serviceService.DeleteAsync(existingService)).Returns(Task.FromResult(failureResponse));

//        // Act
//        var result = await _controller.DeleteService(serviceId);

//        // Assert
//        var badRequestResult = result.Result as BadRequestObjectResult;
//        badRequestResult.Should().NotBeNull();
//        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

//        var response = badRequestResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Contain("Cannot delete service");
//    }

//    [Fact]
//    public async Task GetAvailableServices_WhenServicesExist_ReturnsOkResponseWithData()
//    {
//        // Arrange
//        var services = new List<Service>
//        {
//            new Service { serviceId = Guid.NewGuid(), serviceName = "Service 201", serviceTypeId = Guid.NewGuid(), isDeleted = false },
//            new Service { serviceId = Guid.NewGuid(), serviceName = "Service 202", serviceTypeId = Guid.NewGuid(), isDeleted = false }
//        };

//        var serviceDTOs = new List<ServiceDTO>
//        {
//            new ServiceDTO { serviceId = services[0].serviceId, serviceName = services[0].serviceName, serviceTypeId = services[0].serviceTypeId },
//            new ServiceDTO { serviceId = services[1].serviceId, serviceName = services[1].serviceName, serviceTypeId = services[1].serviceTypeId }
//        };

//        A.CallTo(() => _serviceService.ListAvailableServicesAsync()).Returns(Task.FromResult<IEnumerable<Service>>(services));

//        // Act
//        var result = await _controller.GetAvailableServices();

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var response = okResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeTrue();
//        response.Message.Should().Be("Available services retrieved successfully");
//        response.Data.Should().NotBeNull();
//    }

//    [Fact]
//    public async Task GetAvailableServices_WhenNoServicesExist_ReturnsNotFound()
//    {
//        // Arrange
//        A.CallTo(() => _serviceService.ListAvailableServicesAsync()).Returns(Task.FromResult<IEnumerable<Service>>(new List<Service>()));

//        // Act
//        var result = await _controller.GetAvailableServices();

//        // Assert
//        var notFoundResult = result.Result as NotFoundObjectResult;
//        notFoundResult.Should().NotBeNull();
//        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

//        var response = notFoundResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Be("No available services found");
//    }

//    [Fact]
//    public async Task GetServiceDetailsById_WhenServiceExists_ReturnsOkResponse()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var service = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 301",
//            serviceTypeId = Guid.NewGuid(),
//            isDeleted = false,
//            ServiceType = new ServiceType { name = "Deluxe Service", price = 200 }
//        };

//        var serviceDTO = new ServiceDTO
//        {
//            serviceId = serviceId,
//            serviceName = "Service 301",
//            serviceTypeId = service.serviceTypeId,
//            status = "Available"
//        };

//        A.CallTo(() => _serviceService.GetServiceDetailsAsync(serviceId)).Returns(Task.FromResult(service));

//        // Act
//        var result = await _controller.GetServiceDetailsById(serviceId);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

//        var response = okResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeTrue();
//        response.Message.Should().Be("Service details retrieved successfully");

//        var returnedDto = response.Data as ServiceDTO;
//        returnedDto.Should().NotBeNull();
//        returnedDto!.serviceId.Should().Be(serviceId);
//    }

//    [Fact]
//    public async Task GetServiceDetailsById_WhenServiceDoesNotExist_ReturnsNotFound()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        A.CallTo(() => _serviceService.GetServiceDetailsAsync(serviceId)).Returns(Task.FromResult<Service>(null));

//        // Act
//        var result = await _controller.GetServiceDetailsById(serviceId);

//        // Assert
//        var notFoundResult = result.Result as NotFoundObjectResult;
//        notFoundResult.Should().NotBeNull();
//        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

//        var response = notFoundResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Contain("not found or has been deleted");
//    }

//    [Fact]
//    public async Task GetServiceDetailsById_WhenExceptionOccurs_ReturnsInternalServerError()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        A.CallTo(() => _serviceService.GetServiceDetailsAsync(serviceId))
//            .Throws(new Exception("Database connection error"));

//        // Act
//        var result = await _controller.GetServiceDetailsById(serviceId);

//        // Assert
//        var statusCodeResult = result.Result as ObjectResult;
//        statusCodeResult.Should().NotBeNull();
//        statusCodeResult!.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);

//        var response = statusCodeResult.Value as Response;
//        response.Should().NotBeNull();
//        response!.Flag.Should().BeFalse();
//        response.Message.Should().Contain("An error occurred");
//    }

//    [Fact]
//    public async Task CreateService_WithImageFile_CallsHandleImageUpload()
//    {
//        // Arrange
//        var serviceTypeId = Guid.NewGuid();
//        var newServiceDto = new ServiceDTO
//        {
//            serviceName = "Service 105",
//            serviceTypeId = serviceTypeId,
//            description = "A nice service"
//        };

//        var serviceType = new ServiceType
//        {
//            serviceTypeId = serviceTypeId,
//            name = "Standard Service"
//        };

//        var newService = new Service
//        {
//            serviceName = "Service 105",
//            serviceTypeId = serviceTypeId,
//            description = "A nice service",
//            serviceImage = "/Images/some-guid.jpg"
//        };

//        var successResponse = new Response(true, "Service created successfully")
//        {
//            Data = newService
//        };

//        // Create a mock IFormFile
//        var mockFormFile = A.Fake<IFormFile>();
//        A.CallTo(() => mockFormFile.Length).Returns(1024); // Non-zero length
//        A.CallTo(() => mockFormFile.FileName).Returns("test.jpg");

//        A.CallTo(() => _serviceTypeService.GetByIdAsync(serviceTypeId)).Returns(Task.FromResult(serviceType));
//        A.CallTo(() => _serviceService.CreateAsync(A<Service>.Ignored)).Returns(Task.FromResult(successResponse));

//        // Act
//        var result = await _controller.CreateService(newServiceDto, mockFormFile);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();
//    }

//    [Fact]
//    public async Task UpdateService_WithNewImageFile_UpdatesImagePath()
//    {
//        // Arrange
//        var serviceId = Guid.NewGuid();
//        var serviceTypeId = Guid.NewGuid();
//        var updatingServiceDto = new ServiceDTO
//        {
//            serviceId = serviceId,
//            serviceName = "Service 106",
//            serviceTypeId = serviceTypeId,
//            description = "Updated description"
//        };

//        var existingService = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 106",
//            serviceTypeId = serviceTypeId,
//            description = "Original description",
//            serviceImage = "/Images/old-image.jpg"
//        };

//        var updatedService = new Service
//        {
//            serviceId = serviceId,
//            serviceName = "Service 106",
//            serviceTypeId = serviceTypeId,
//            description = "Updated description",
//            serviceImage = "/Images/new-image.jpg"
//        };

//        var successResponse = new Response(true, "Service updated successfully")
//        {
//            Data = updatedService
//        };

//        // Create a mock IFormFile
//        var mockFormFile = A.Fake<IFormFile>();
//        A.CallTo(() => mockFormFile.Length).Returns(1024); // Non-zero length
//        A.CallTo(() => mockFormFile.FileName).Returns("new-image.jpg");

//        A.CallTo(() => _serviceService.GetByIdAsync(serviceId)).Returns(Task.FromResult(existingService));
//        A.CallTo(() => _serviceService.UpdateAsync(A<Service>.Ignored)).Returns(Task.FromResult(successResponse));

//        // Act
//        var result = await _controller.UpdateService(updatingServiceDto, mockFormFile);

//        // Assert
//        var okResult = result.Result as OkObjectResult;
//        okResult.Should().NotBeNull();

//    }
//}
