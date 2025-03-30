using FacilityServiceApi.Application.DTO;
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

namespace UnitTest.FacilityServiceApi.Controllers
{
    public class ReportFacilityControllerTest
    {
        private readonly IReport _report;
        private readonly ReportFacilityController _controller;

        public ReportFacilityControllerTest()
        {
            _report = A.Fake<IReport>();
            _controller = new ReportFacilityController(_report);
        }

        [Fact]
        public async Task GetAvailableRooms_WhenRoomsExist_ReturnsOk()
        {
            // Arrange
            var roomList = new List<Room>
        {
            new Room { roomId = Guid.NewGuid(), roomName = "Room A", isDeleted = false },
            new Room { roomId = Guid.NewGuid(), roomName = "Room B", isDeleted = false }
        };

            var roomDtos = new List<RoomDTO>
        {
            new RoomDTO { roomId = roomList[0].roomId, roomName = "Room A" },
            new RoomDTO { roomId = roomList[1].roomId, roomName = "Room B" }
        };

            A.CallTo(() => _report.ListActiveRoomsAsync())
    .Returns(Task.FromResult<IEnumerable<Room>>(roomList));



            // Act
            var (_, convertedRoomDtos) = RoomConversion.FromEntity(null!, roomList);


            var result = await _controller.GetAvailableRooms();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Available rooms retrieved successfully");
            response.Data.Should().BeEquivalentTo(convertedRoomDtos);
        }

        [Fact]
        public async Task GetAvailableRooms_WhenNoRoomsExist_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _report.ListActiveRoomsAsync())
    .Returns(Task.FromResult<IEnumerable<Room>>(new List<Room>()));


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
        public async Task GetRoomStatusList_WhenRoomStatusExists_ReturnsOk()
        {
            // Arrange
            var roomStatusList = new List<RoomStatusDTO>
        {
            new RoomStatusDTO("Available",5 ),
            new RoomStatusDTO ("Occupied", 7)
        };

            A.CallTo(() => _report.GetRoomStatusList())
                .Returns(Task.FromResult<IEnumerable<RoomStatusDTO>>(roomStatusList));

            // Act
            var result = await _controller.GetRoomStatusList();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Room status retrieved successfully");
            response.Data.Should().BeEquivalentTo(roomStatusList);
        }

        [Fact]
        public async Task GetRoomStatusList_WhenNoRoomStatusExists_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _report.GetRoomStatusList())
                .Returns(Task.FromResult<IEnumerable<RoomStatusDTO>>(new List<RoomStatusDTO>()));

            // Act
            var result = await _controller.GetRoomStatusList();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No room status found in the database");
        }

        [Fact]
        public async Task GetRoomHistory_WhenRoomHistoriesExist_ReturnsOk()
        {
            // Arrange
            var roomHistoryList = new List<RoomHistoryQuantityDTO>
        {
            new RoomHistoryQuantityDTO( "Deluxe", 10 ),
            new RoomHistoryQuantityDTO ("Standard", 5 )
        };

            A.CallTo(() => _report.GetRoomTypeQuantity(A<int?>._, A<int?>._, A<DateTime?>._, A<DateTime?>._))
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(roomHistoryList));

            // Act
            var result = await _controller.GetRoomHistory(null, null, null, null);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Room histories retrieved successfully");
            response.Data.Should().BeEquivalentTo(roomHistoryList);
        }

        [Fact]
        public async Task GetRoomHistory_WhenNoRoomHistoriesExist_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _report.GetRoomTypeQuantity(A<int?>._, A<int?>._, A<DateTime?>._, A<DateTime?>._))
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(new List<RoomHistoryQuantityDTO>()));

            // Act
            var result = await _controller.GetRoomHistory(null, null, null, null);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No room histories found in the database");
        }

        [Fact]
        public async Task GetBookingServiceItem_WhenItemsExist_ReturnsOk()
        {
            // Arrange
            var serviceItems = new List<RoomHistoryQuantityDTO>
        {
            new RoomHistoryQuantityDTO("Service 1",15 ),
            new RoomHistoryQuantityDTO ("Service 2", 8)
        };

            A.CallTo(() => _report.GetServiceQuantity(A<int?>._, A<int?>._, A<DateTime?>._, A<DateTime?>._))
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(serviceItems));

            // Act
            var result = await _controller.GetBookingServiceItem(null, null, null, null);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking service items retrieved successfully");
            response.Data.Should().BeEquivalentTo(serviceItems);
        }

        [Fact]
        public async Task GetBookingServiceItem_WhenNoItemsExist_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _report.GetServiceQuantity(A<int?>._, A<int?>._, A<DateTime?>._, A<DateTime?>._))
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(new List<RoomHistoryQuantityDTO>()));

            // Act
            var result = await _controller.GetBookingServiceItem(null, null, null, null);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No booking service items found in the database");
        }

        [Fact]
        public async Task GetPetCount_WhenDataExists_ReturnsOk()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var petCounts = new List<PetCountDTO>
        {
            new PetCountDTO (Guid.NewGuid(), 3),
            new PetCountDTO (Guid.NewGuid(), 5)
        };

            A.CallTo(() => _report.GetAllBookingByPet(petId, A<int?>._, A<int?>._, A<DateTime?>._, A<DateTime?>._))
                .Returns(Task.FromResult<IEnumerable<PetCountDTO>>(petCounts));

            // Act
            var result = await _controller.GetPetCount(petId, null, null, null, null);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(petCounts);
        }

        [Fact]
        public async Task GetPetCount_WhenNoDataExists_ReturnsNotFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            A.CallTo(() => _report.GetAllBookingByPet(petId, A<int?>._, A<int?>._, A<DateTime?>._, A<DateTime?>._))
                .Returns(Task.FromResult<IEnumerable<PetCountDTO>>(new List<PetCountDTO>()));

            // Act
            var result = await _controller.GetPetCount(petId, null, null, null, null);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No pet count dtos found in the database");
        }

        [Fact]
        public async Task GetActiveRoomTypes_WhenDataExists_ReturnsOk()
        {
            // Arrange
            var roomTypes = new List<RoomHistoryQuantityDTO>
        {
            new RoomHistoryQuantityDTO ("Deluxe", 10),
            new RoomHistoryQuantityDTO ("Standard", 5)
        };

            A.CallTo(() => _report.GetActiveRoomTypeList())
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(roomTypes));

            // Act
            var result = await _controller.GetActiveRoomTypes();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Room type retrieved successfully");
            response.Data.Should().BeEquivalentTo(roomTypes);
        }

        [Fact]
        public async Task GetActiveRoomTypes_WhenNoDataExists_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _report.GetActiveRoomTypeList())
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(new List<RoomHistoryQuantityDTO>()));

            // Act
            var result = await _controller.GetActiveRoomTypes();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No room type found in the database");
        }

        [Fact]
        public async Task GetActiveServiceTypes_WhenDataExists_ReturnsOk()
        {
            // Arrange
            var serviceTypes = new List<RoomHistoryQuantityDTO>
        {
            new RoomHistoryQuantityDTO("Grooming", 20 ),
            new RoomHistoryQuantityDTO ("Boarding", 15)
        };

            A.CallTo(() => _report.GetActiveServiceTypeList())
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(serviceTypes));

            // Act
            var result = await _controller.GetActiveServiceTypes();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Service type retrieved successfully");
            response.Data.Should().BeEquivalentTo(serviceTypes);
        }

        [Fact]
        public async Task GetActiveServiceTypes_WhenNoDataExists_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _report.GetActiveServiceTypeList())
                .Returns(Task.FromResult<IEnumerable<RoomHistoryQuantityDTO>>(new List<RoomHistoryQuantityDTO>()));

            // Act
            var result = await _controller.GetActiveServiceTypes();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No service type found in the database");
        }
    }
}
