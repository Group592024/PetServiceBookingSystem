using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Presentation.Controllers;
using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace UnitTest.FacilityServiceApi.Controllers
{
    public class RoomHistoriesControllerTest
    {
        private readonly IRoomHistory _roomHistoryService;
        private readonly RoomHistoriesController _controller;

        public RoomHistoriesControllerTest()
        {
            _roomHistoryService = A.Fake<IRoomHistory>();
            _controller = new RoomHistoriesController(_roomHistoryService);
        }

        [Fact]
        public void Get_WhenCalled_ReturnsOkResultWithValues()
        {
            // Arrange
            var expectedValues = new string[] { "value1", "value2" };

            // Act
            var result = _controller.Get();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEquivalentTo(expectedValues);
        }


        [Fact]
        public async Task GetRoomHistoryByBookingId_WhenNoRoomHistoriesExist_ReturnsNotFound()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            A.CallTo(() => _roomHistoryService.GetRoomHistoryByBookingId(bookingId))
                .Returns(Task.FromResult<IEnumerable<RoomHistory>>(new List<RoomHistory>()));

            // Act
            var result = await _controller.GetRoomHistoryByBookingId(bookingId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No item detected");
        }

        [Fact]
        public async Task CreateRoomHistory_WithValidData_ReturnsOkResponse()
        {
            // Arrange
            var createDto = new CreateRoomHistoryDTO(
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                DateTime.Now,
                DateTime.Now.AddDays(1),
                true
            );

            var successResponse = new Response(true, "Room history created successfully");

            A.CallTo(() => _roomHistoryService.CreateAsync(A<RoomHistory>.Ignored))
                .Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.CreateRoomHistory(createDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Contain("successfully");
        }

        

        [Fact]
        public async Task CreateRoomHistory_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateRoomHistoryDTO(
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                DateTime.Now,
                DateTime.Now.AddDays(1),
                true
            );

            var failureResponse = new Response(false, "Failed to create room history");

            A.CallTo(() => _roomHistoryService.CreateAsync(A<RoomHistory>.Ignored))
                .Returns(Task.FromResult(failureResponse));

            // Act
            var result = await _controller.CreateRoomHistory(createDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Contain("Failed");
        }

        [Fact]
        public async Task UpdateRoomHistory_WithValidData_ReturnsOkResponse()
        {
            // Arrange
            var roomHistoryDto = new RoomHistoryDTO(
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                "CheckedIn",
                DateTime.Now,
                null,
                DateTime.Now,
                DateTime.Now.AddDays(1),
                true
            );

            var successResponse = new Response(true, "Room history updated successfully");

            A.CallTo(() => _roomHistoryService.UpdateAsync(A<RoomHistory>.Ignored))
                .Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.UpdateRoomHistory(roomHistoryDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Contain("successfully");
        }

       
        [Fact]
        public async Task UpdateRoomHistory_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var roomHistoryDto = new RoomHistoryDTO(
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                "CheckedIn",
                DateTime.Now,
                null,
                DateTime.Now,
                DateTime.Now.AddDays(1),
                true
            );

            var failureResponse = new Response(false, "Failed to update room history");

            A.CallTo(() => _roomHistoryService.UpdateAsync(A<RoomHistory>.Ignored))
                .Returns(Task.FromResult(failureResponse));

            // Act
            var result = await _controller.UpdateRoomHistory(roomHistoryDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Contain("Failed");
        }
       
        [Fact]
        public async Task GetRoomHistoryByBookingId_WhenRoomHistoriesExist_ReturnsOkResponseWithData()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var roomHistories = new List<RoomHistory>
    {
        new RoomHistory
        {
            RoomHistoryId = Guid.NewGuid(),
            PetId = Guid.NewGuid(),
            RoomId = Guid.NewGuid(),
            BookingId = bookingId,
            Status = "Pending",
            BookingStartDate = DateTime.Now,
            BookingEndDate = DateTime.Now.AddDays(1),
            BookingCamera = true
        },
        new RoomHistory
        {
            RoomHistoryId = Guid.NewGuid(),
            PetId = Guid.NewGuid(),
            RoomId = Guid.NewGuid(),
            BookingId = bookingId,
            Status = "Pending",
            BookingStartDate = DateTime.Now,
            BookingEndDate = DateTime.Now.AddDays(1),
            BookingCamera = true
        }
    };

            A.CallTo(() => _roomHistoryService.GetRoomHistoryByBookingId(bookingId))
                .Returns(Task.FromResult<IEnumerable<RoomHistory>>(roomHistories));

            // Act
            var result = await _controller.GetRoomHistoryByBookingId(bookingId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking room item retrieved successfully!");
            response.Data.Should().NotBeNull();

            // The data is likely returned as IEnumerable<RoomHistory> from the service
            // and converted to DTOs in the controller
            var returnedData = response.Data as IEnumerable<RoomHistory>;
            returnedData.Should().NotBeNull();
            returnedData!.Count().Should().Be(2);
        }

    }
}