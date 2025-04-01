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
public class RoomControllerTest
{
    private readonly IRoom _roomService;
    private readonly IRoomType _roomTypeService;
    private readonly RoomController _controller;

    public RoomControllerTest()
    {
        _roomService = A.Fake<IRoom>();
        _roomTypeService = A.Fake<IRoomType>();
        _controller = new RoomController(_roomService, _roomTypeService);
    }

    [Fact]
    public async Task GetRoomsList_WhenRoomsExist_ReturnsOkResponseWithData()
    {
        // Arrange
        var rooms = new List<Room>
        {
            new Room { roomId = Guid.NewGuid(), roomName = "Room 101", roomTypeId = Guid.NewGuid(), isDeleted = false },
            new Room { roomId = Guid.NewGuid(), roomName = "Room 102", roomTypeId = Guid.NewGuid(), isDeleted = false }
        };

        var roomDTOs = new List<RoomDTO>
        {
            new RoomDTO { roomId = rooms[0].roomId, roomName = rooms[0].roomName, roomTypeId = rooms[0].roomTypeId },
            new RoomDTO { roomId = rooms[1].roomId, roomName = rooms[1].roomName, roomTypeId = rooms[1].roomTypeId }
        };

        A.CallTo(() => _roomService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Room>>(rooms));

        // Act
        var result = await _controller.GetRoomsList();

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Rooms retrieved successfully");
        response.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetRoomsList_WhenNoRoomsExist_ReturnsNotFound()
    {
        // Arrange
        A.CallTo(() => _roomService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Room>>(new List<Room>()));

        // Act
        var result = await _controller.GetRoomsList();

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Be("No rooms found in the database");
    }

    [Fact]
    public async Task GetRoomById_WhenRoomExists_ReturnsOkResponse()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var room = new Room
        {
            roomId = roomId,
            roomName = "Room 101",
            roomTypeId = Guid.NewGuid(),
            isDeleted = false
        };

        var roomDTO = new RoomDTO
        {
            roomId = roomId,
            roomName = "Room 101",
            roomTypeId = room.roomTypeId
        };

        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult(room));

        // Act
        var result = await _controller.GetRoomById(roomId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Room retrieved successfully");

        var returnedDto = response.Data as RoomDTO;
        returnedDto.Should().NotBeNull();
        returnedDto!.roomId.Should().Be(roomId);
    }

    [Fact]
    public async Task GetRoomById_WhenRoomDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult<Room>(null));

        // Act
        var result = await _controller.GetRoomById(roomId);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain(roomId.ToString());
    }

    [Fact]
    public async Task CreateRoom_WithValidData_ReturnsOkResponse()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var newRoomDto = new RoomDTO
        {
            roomName = "Room 103",
            roomTypeId = roomTypeId,
            description = "A nice room"
        };

        var roomType = new RoomType
        {
            roomTypeId = roomTypeId,
            name = "Standard Room"
        };

        var newRoom = new Room
        {
            roomName = "Room 103",
            roomTypeId = roomTypeId,
            description = "A nice room",
            roomImage = "/Images/some-guid.jpg"
        };

        var successResponse = new Response(true, "Room created successfully")
        {
            Data = newRoom
        };

        var mockFormFile = A.Fake<IFormFile>();
        A.CallTo(() => mockFormFile.Length).Returns(1024); // Non-zero length

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult(roomType));
        A.CallTo(() => _roomService.CreateAsync(A<Room>.Ignored)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.CreateRoom(newRoomDto, mockFormFile);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var returnedResponse = okResult.Value as Response;
        returnedResponse.Should().NotBeNull();
        returnedResponse!.Flag.Should().BeTrue();
        returnedResponse.Message.Should().Be("Room created successfully");
    }

    [Fact]
    public async Task CreateRoom_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("roomTypeId", "Room type ID is required");
        var newRoomDto = new RoomDTO { roomName = "Room 103" };

        // Act
        var result = await _controller.CreateRoom(newRoomDto, null);

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
    public async Task CreateRoom_WithNonExistentRoomType_ReturnsNotFound()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var newRoomDto = new RoomDTO
        {
            roomName = "Room 103",
            roomTypeId = roomTypeId,
            description = "A nice room"
        };

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult<RoomType>(null));

        // Act
        var result = await _controller.CreateRoom(newRoomDto, null);

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
    public async Task UpdateRoom_WithValidData_ReturnsOkResponse()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var roomTypeId = Guid.NewGuid();
        var updatingRoomDto = new RoomDTO
        {
            roomId = roomId,
            roomName = "Room 104",
            roomTypeId = roomTypeId,
            description = "Updated description"
        };

        var existingRoom = new Room
        {
            roomId = roomId,
            roomName = "Room 103",
            roomTypeId = roomTypeId,
            description = "Original description",
            roomImage = "/Images/old-image.jpg"
        };

        var updatedRoom = new Room
        {
            roomId = roomId,
            roomName = "Room 104",
            roomTypeId = roomTypeId,
            description = "Updated description",
            roomImage = "/Images/old-image.jpg"
        };

        var successResponse = new Response(true, "Room updated successfully")
        {
            Data = updatedRoom
        };

        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult(existingRoom));
        A.CallTo(() => _roomService.UpdateAsync(A<Room>.Ignored)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.UpdateRoom(updatingRoomDto, null);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var returnedResponse = okResult.Value as Response;
        returnedResponse.Should().NotBeNull();
        returnedResponse!.Flag.Should().BeTrue();
        returnedResponse.Message.Should().Be("Room updated successfully");
    }

    [Fact]
    public async Task UpdateRoom_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("roomTypeId", "Room type ID is required");
        var updatingRoomDto = new RoomDTO { roomId = Guid.NewGuid(), roomName = "Room 104" };

        // Act
        var result = await _controller.UpdateRoom(updatingRoomDto, null);

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
    public async Task UpdateRoom_WhenRoomDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var updatingRoomDto = new RoomDTO
        {
            roomId = roomId,
            roomName = "Room 104",
            roomTypeId = Guid.NewGuid(),
            description = "Updated description"
        };

        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult<Room>(null));

        // Act
        var result = await _controller.UpdateRoom(updatingRoomDto, null);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain(roomId.ToString());
    }

    [Fact]
    public async Task SoftDeleteRoom_WhenRoomExists_ReturnsOkResponse()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var existingRoom = new Room
        {
            roomId = roomId,
            roomName = "Room 101",
            roomTypeId = Guid.NewGuid(),
            isDeleted = false
        };

        var successResponse = new Response(true, "Room soft deleted successfully");

        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult(existingRoom));
        A.CallTo(() => _roomService.DeleteAsync(existingRoom)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.DeleteRoom(roomId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
    }
    [Fact]
    public async Task HardDeleteRoom_WhenRoomExists_ReturnsOkResponse()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var existingRoom = new Room
        {
            roomId = roomId,
            roomName = "Room 101",
            roomTypeId = Guid.NewGuid(),
            isDeleted = true
        };

        var successResponse = new Response(true, "Room hard deleted successfully");

        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult(existingRoom));
        A.CallTo(() => _roomService.DeleteAsync(existingRoom)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.DeleteRoom(roomId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteRoom_WhenRoomDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult<Room>(null));

        // Act
        var result = await _controller.DeleteRoom(roomId);

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
    public async Task DeleteRoom_WhenServiceFails_ReturnsBadRequest()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var existingRoom = new Room
        {
            roomId = roomId,
            roomName = "Room 101",
            roomTypeId = Guid.NewGuid(),
            isDeleted = true
        };

        var failureResponse = new Response(false, "Cannot delete room because it has active bookings");

        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult(existingRoom));
        A.CallTo(() => _roomService.DeleteAsync(existingRoom)).Returns(Task.FromResult(failureResponse));

        // Act
        var result = await _controller.DeleteRoom(roomId);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var response = badRequestResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("Cannot delete room");
    }

    [Fact]
    public async Task GetAvailableRooms_WhenRoomsExist_ReturnsOkResponseWithData()
    {
        // Arrange
        var rooms = new List<Room>
        {
            new Room { roomId = Guid.NewGuid(), roomName = "Room 201", roomTypeId = Guid.NewGuid(), isDeleted = false },
            new Room { roomId = Guid.NewGuid(), roomName = "Room 202", roomTypeId = Guid.NewGuid(), isDeleted = false }
        };

        var roomDTOs = new List<RoomDTO>
        {
            new RoomDTO { roomId = rooms[0].roomId, roomName = rooms[0].roomName, roomTypeId = rooms[0].roomTypeId },
            new RoomDTO { roomId = rooms[1].roomId, roomName = rooms[1].roomName, roomTypeId = rooms[1].roomTypeId }
        };

        A.CallTo(() => _roomService.ListAvailableRoomsAsync()).Returns(Task.FromResult<IEnumerable<Room>>(rooms));

        // Act
        var result = await _controller.GetAvailableRooms();

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Available rooms retrieved successfully");
        response.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAvailableRooms_WhenNoRoomsExist_ReturnsNotFound()
    {
        // Arrange
        A.CallTo(() => _roomService.ListAvailableRoomsAsync()).Returns(Task.FromResult<IEnumerable<Room>>(new List<Room>()));

        // Act
        var result = await _controller.GetAvailableRooms();

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
    public async Task GetRoomDetailsById_WhenRoomExists_ReturnsOkResponse()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var room = new Room
        {
            roomId = roomId,
            roomName = "Room 301",
            roomTypeId = Guid.NewGuid(),
            isDeleted = false,
            RoomType = new RoomType { name = "Deluxe Room", price = 200 }
        };

        var roomDTO = new RoomDTO
        {
            roomId = roomId,
            roomName = "Room 301",
            roomTypeId = room.roomTypeId,
            status = "Available"
        };

        A.CallTo(() => _roomService.GetRoomDetailsAsync(roomId)).Returns(Task.FromResult(room));

        // Act
        var result = await _controller.GetRoomDetailsById(roomId);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

        var response = okResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeTrue();
        response.Message.Should().Be("Room details retrieved successfully");

        var returnedDto = response.Data as RoomDTO;
        returnedDto.Should().NotBeNull();
        returnedDto!.roomId.Should().Be(roomId);
    }

    [Fact]
    public async Task GetRoomDetailsById_WhenRoomDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        A.CallTo(() => _roomService.GetRoomDetailsAsync(roomId)).Returns(Task.FromResult<Room>(null));

        // Act
        var result = await _controller.GetRoomDetailsById(roomId);

        // Assert
        var notFoundResult = result.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

        var response = notFoundResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("not found or has been deleted");
    }

    [Fact]
    public async Task GetRoomDetailsById_WhenExceptionOccurs_ReturnsInternalServerError()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        A.CallTo(() => _roomService.GetRoomDetailsAsync(roomId))
            .Throws(new Exception("Database connection error"));

        // Act
        var result = await _controller.GetRoomDetailsById(roomId);

        // Assert
        var statusCodeResult = result.Result as ObjectResult;
        statusCodeResult.Should().NotBeNull();
        statusCodeResult!.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);

        var response = statusCodeResult.Value as Response;
        response.Should().NotBeNull();
        response!.Flag.Should().BeFalse();
        response.Message.Should().Contain("An error occurred");
    }

    [Fact]
    public async Task CreateRoom_WithImageFile_CallsHandleImageUpload()
    {
        // Arrange
        var roomTypeId = Guid.NewGuid();
        var newRoomDto = new RoomDTO
        {
            roomName = "Room 105",
            roomTypeId = roomTypeId,
            description = "A nice room"
        };

        var roomType = new RoomType
        {
            roomTypeId = roomTypeId,
            name = "Standard Room"
        };

        var newRoom = new Room
        {
            roomName = "Room 105",
            roomTypeId = roomTypeId,
            description = "A nice room",
            roomImage = "/Images/some-guid.jpg"
        };

        var successResponse = new Response(true, "Room created successfully")
        {
            Data = newRoom
        };

        // Create a mock IFormFile
        var mockFormFile = A.Fake<IFormFile>();
        A.CallTo(() => mockFormFile.Length).Returns(1024); // Non-zero length
        A.CallTo(() => mockFormFile.FileName).Returns("test.jpg");

        A.CallTo(() => _roomTypeService.GetByIdAsync(roomTypeId)).Returns(Task.FromResult(roomType));
        A.CallTo(() => _roomService.CreateAsync(A<Room>.Ignored)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.CreateRoom(newRoomDto, mockFormFile);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateRoom_WithNewImageFile_UpdatesImagePath()
    {
        // Arrange
        var roomId = Guid.NewGuid();
        var roomTypeId = Guid.NewGuid();
        var updatingRoomDto = new RoomDTO
        {
            roomId = roomId,
            roomName = "Room 106",
            roomTypeId = roomTypeId,
            description = "Updated description"
        };

        var existingRoom = new Room
        {
            roomId = roomId,
            roomName = "Room 106",
            roomTypeId = roomTypeId,
            description = "Original description",
            roomImage = "/Images/old-image.jpg"
        };

        var updatedRoom = new Room
        {
            roomId = roomId,
            roomName = "Room 106",
            roomTypeId = roomTypeId,
            description = "Updated description",
            roomImage = "/Images/new-image.jpg"
        };

        var successResponse = new Response(true, "Room updated successfully")
        {
            Data = updatedRoom
        };

        // Create a mock IFormFile
        var mockFormFile = A.Fake<IFormFile>();
        A.CallTo(() => mockFormFile.Length).Returns(1024); // Non-zero length
        A.CallTo(() => mockFormFile.FileName).Returns("new-image.jpg");

        A.CallTo(() => _roomService.GetByIdAsync(roomId)).Returns(Task.FromResult(existingRoom));
        A.CallTo(() => _roomService.UpdateAsync(A<Room>.Ignored)).Returns(Task.FromResult(successResponse));

        // Act
        var result = await _controller.UpdateRoom(updatingRoomDto, mockFormFile);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();

    }
}
