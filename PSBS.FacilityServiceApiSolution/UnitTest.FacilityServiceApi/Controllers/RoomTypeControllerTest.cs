using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Presentation.Controllers;
using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.FacilityServiceApi.Controllers;
public class RoomTypeControllerTest
{
    private readonly IRoomType _roomTypeService;
    private readonly RoomTypeController _controller;

    public RoomTypeControllerTest()
    {
        _roomTypeService = A.Fake<IRoomType>();
        _controller = new RoomTypeController(_roomTypeService);
    }

    [Fact]
    public async Task GetRoomTypes_WhenRoomTypesExist_ReturnsOkResponseWithData()
    {
        // Arrange
        var roomTypes = new List<RoomType>
    {
        new RoomType { roomTypeId = Guid.NewGuid(), name = "Single Room", price = 100, description = "A single room", isDeleted = false },
        new RoomType { roomTypeId = Guid.NewGuid(), name = "Double Room", price = 150, description = "A double room", isDeleted = false }
    };

        var roomTypeDTOs = roomTypes.Select(rt => new RoomTypeDTO
        {
            roomTypeId = rt.roomTypeId,
            name = rt.name,
            price = rt.price,
            description = rt.description,
            isDeleted = rt.isDeleted
        }).ToList();

        A.CallTo(() => _roomTypeService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<RoomType>>(roomTypes));

        // Act
        var result = await _controller.GetRoomTypes();

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Room types retrieved successfully");
        response.Data.Should().BeEquivalentTo(roomTypeDTOs);
    }

    [Fact]
    public async Task GetRoomTypes_WhenNoRoomTypesExist_ReturnsNotFound()
    {
        // Arrange
        A.CallTo(() => _roomTypeService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<RoomType>>(new List<RoomType>()));

        // Act
        var result = await _controller.GetRoomTypes();

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        
        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("No room types found in the database");
    }

    [Fact]
    public async Task GetRoomTypeById_WhenRoomTypeExists_ReturnsOkResponse()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var roomType = new RoomType { 
            roomTypeId = roomTypeId, 
            name = "Luxury Suite", 
            price = 500, 
            description = "Luxury suite with ocean view",
            isDeleted = false
        };
        
        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult(roomType));

        // Act
        var result = await _controller.GetRoomTypeById(roomTypeId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        
        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("RoomType retrieved successfully");
        
        var returnedDto = response.Data as RoomTypeDTO;
        returnedDto.Should().NotBeNull();
        returnedDto!.roomTypeId.Should().Be(roomTypeId);
        returnedDto.name.Should().Be("Luxury Suite");
        returnedDto.price.Should().Be(500);
    }

    [Fact]
    public async Task GetRoomTypeById_WhenRoomTypeDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult<RoomType>(null));

        // Act
        var result = await _controller.GetRoomTypeById(roomTypeId);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        
        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain(roomTypeId.ToString());
    }

    [Fact]
    public async Task CreateRoomType_WithValidData_ReturnsOkResponse()
    {
        // Arrange
        var newRoomTypeDto = new RoomTypeDTO
        {
            name = "Deluxe Room",
            price = 200,
            description = "A deluxe room"
        };

        var successResponse = new Response(true, "Deluxe Room added successfully")
        {
            Data = new RoomType
            {
                roomTypeId = Guid.NewGuid(), 
                name = "Deluxe Room",
                price = 200,
                description = "A deluxe room",
                isDeleted = false
            }
        };

        A.CallTo(() => _roomTypeService.CreateAsync(A<RoomType>.Ignored))
            .Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.CreateRoomType(newRoomTypeDto);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var returnedResponse = okResult.Value as Response;
        returnedResponse.Should().NotBeNull();
        returnedResponse!.Flag.Should().BeTrue();
        returnedResponse.Message.Should().Be("Deluxe Room added successfully");
        returnedResponse.Data.Should().BeOfType<RoomType>();
    }

    [Fact]
    public async Task CreateRoomType_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("name", "Name is required");
        var newRoomType = new RoomTypeDTO { price = 200 };

        // Act
        var result = await _controller.CreateRoomType(newRoomType);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        
        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("Invalid input");
    }

    [Fact]
    public async Task CreateRoomType_WhenServiceFails_ReturnsBadRequest()
    {
        // Arrange
        var newRoomTypeDto = new RoomTypeDTO
        {
            name = "Existing Room",
            price = 200,
            description = "This room already exists"
        };

        var newRoomType = new RoomType
        {
            name = "Existing Room",
            price = 200,
            description = "This room already exists"
        };

        var failureResponse = new Response(false, "RoomType with name 'Existing Room' already exists!");

        A.CallTo(() => _roomTypeService.CreateAsync(A<RoomType>.That.Matches(r => r.name == newRoomType.name)))
            .Returns(Task.FromResult(failureResponse));

        // Act
        var result = await _controller.CreateRoomType(newRoomTypeDto);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("RoomType with name 'Existing Room' already exists!");
    }


    [Fact]
    public async Task UpdateRoomType_WithValidData_ReturnsOkResponse()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var updatingRoomTypeDto = new RoomTypeDTO
        {
            roomTypeId = roomTypeId,
            name = "Updated Room",
            price = 250,
            description = "Updated description"
        };

        var existingRoomType = new RoomType
        {
            roomTypeId = roomTypeId,
            name = "Old Room",
            price = 200,
            description = "Old description",
            isDeleted = false
        };

        var successResponse = new Response(true, "Updated Room updated successfully")
        {
            Data = new RoomTypeDTO
            {
                roomTypeId = roomTypeId,
                name = "Updated Room",
                price = 250,
                description = "Updated description"
            }
        };

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId))
            .Returns(Task.FromResult(existingRoomType));

        A.CallTo(() => _roomTypeService.UpdateAsync(A<RoomType>.Ignored))
            .Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.UpdateRoomType(updatingRoomTypeDto);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var returnedResponse = okResult.Value as Response;
        returnedResponse.Should().NotBeNull();
        returnedResponse!.Flag.Should().BeTrue();
        returnedResponse.Message.Should().Be("Updated Room updated successfully");
        returnedResponse.Data.Should().BeOfType<RoomTypeDTO>();
    }

    [Fact]
    public async Task UpdateRoomType_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("name", "Name is required");
        var updatingRoomType = new RoomTypeDTO { roomTypeId = Guid.NewGuid(), price = 200 };

        // Act
        var result = await _controller.UpdateRoomType(updatingRoomType);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        
        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("Invalid input");
    }

    [Fact]
    public async Task UpdateRoomType_WhenRoomTypeDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var updatingRoomTypeDto = new RoomTypeDTO
        {
            roomTypeId = roomTypeId,
            name = "Updated Room",
            price = 250
        };

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId))
            .Returns(Task.FromResult<RoomType>(null));

        // Act
        var result = await _controller.UpdateRoomType(updatingRoomTypeDto);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain(roomTypeId.ToString());
    }


    [Fact]
    public async Task SoftDeleteRoomType_WhenRoomTypeExists_ReturnsOkResponse()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var existingRoomType = new RoomType { 
            roomTypeId = roomTypeId, 
            name = "Test Room", 
            price = 100,
            isDeleted = false
        };
        
        var successResponse = new Response(true, "RoomType and associated rooms soft deleted successfully.") { 
            Data = new RoomTypeDTO {
                roomTypeId = roomTypeId,
                name = "Test Room",
                price = 100,
                isDeleted = true
            }
        };

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult(existingRoomType));
        A.CallTo(() => _roomTypeService.DeleteAsync(existingRoomType)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.DeleteRoomType(roomTypeId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        
        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("RoomType and associated rooms soft deleted successfully.");
        
        var returnedDto = response.Data as RoomTypeDTO;
        returnedDto.Should().NotBeNull();
        returnedDto!.isDeleted.Should().BeTrue();
    }
    [Fact]
    public async Task HardDeleteRoomType_WhenRoomTypeExists_ReturnsOkResponse()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var existingRoomType = new RoomType
        {
            roomTypeId = roomTypeId,
            name = "Test Room",
            price = 100,
            isDeleted = false
        };

        var successResponse = new Response(true, "RoomType permanently deleted.") { Data = null };

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult(existingRoomType));
        A.CallTo(() => _roomTypeService.DeleteAsync(existingRoomType)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.DeleteRoomType(roomTypeId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("RoomType permanently deleted.");
        response.Data.Should().BeNull();
    }

    [Fact]
    public async Task DeleteRoomType_WhenRoomTypeDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult<RoomType>(null));

        // Act
        var result = await _controller.DeleteRoomType(roomTypeId);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        
        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("not found or already deleted");
    }
    
    [Fact]
    public async Task DeleteRoomType_WhenServiceFails_ReturnsBadRequest()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var existingRoomType = new RoomType { 
            roomTypeId = roomTypeId, 
            name = "Test Room", 
            price = 100,
            isDeleted = true
        };
        
        var failureResponse = new Response(false, "Cannot permanently delete RoomType with name Test Room because there are linked rooms.");

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult(existingRoomType));
        A.CallTo(() => _roomTypeService.DeleteAsync(existingRoomType)).Returns(Task.FromResult(failureResponse));

        // Act
        var result = await _controller.DeleteRoomType(roomTypeId);

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
    public async Task GetAvailableRoomTypes_WhenRoomTypesExist_ReturnsOkResponseWithData()
    {
        // Arrange
        var roomTypes = new List<RoomType>
    {
        new RoomType { roomTypeId = Guid.NewGuid(), name = "Available Room 1", price = 100, description = "Available room 1", isDeleted = false },
        new RoomType { roomTypeId = Guid.NewGuid(), name = "Available Room 2", price = 150, description = "Available room 2", isDeleted = false }
    };

        A.CallTo(() => _roomTypeService.ListAvailableRoomTypeAsync())
            .Returns(Task.FromResult<IEnumerable<RoomType>>(roomTypes));

        // Act
        var result = await _controller.GetAvailableRoomTypes();

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Available rooms retrieved successfully");
        response.Data.Should().NotBeNull();

        var returnedRoomTypes = response.Data as List<RoomTypeDTO>;
        returnedRoomTypes.Should().NotBeNull();
        returnedRoomTypes!.Count.Should().Be(roomTypes.Count);
        returnedRoomTypes[0].roomTypeId.Should().Be(roomTypes[0].roomTypeId);
        returnedRoomTypes[1].roomTypeId.Should().Be(roomTypes[1].roomTypeId);
    }

    [Fact]
    public async Task GetAvailableRoomTypes_WhenNoRoomTypesExist_ReturnsNotFound()
    {
        // Arrange
        A.CallTo(() => _roomTypeService.ListAvailableRoomTypeAsync()).Returns(Task.FromResult<IEnumerable<RoomType>>(new List<RoomType>()));

        // Act
        var result = await _controller.GetAvailableRoomTypes();

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        
        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("No available rooms found");
    }
    
    [Fact]
    public async Task GetAvailableRoomTypes_WhenExceptionOccurs_ThrowsException()
    {
        // Arrange
        A.CallTo(() => _roomTypeService.ListAvailableRoomTypeAsync())
            .Throws(new InvalidOperationException("Error occurred retrieving non-deleted rooms"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _controller.GetAvailableRoomTypes());
    }
}
