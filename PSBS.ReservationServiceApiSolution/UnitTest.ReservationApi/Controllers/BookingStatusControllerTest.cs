using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Presentation.Controllers;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace UnitTest.ReservationApi.Controllers
{
    public class BookingStatusControllerTest
    {
        private readonly IBookingStatus _bookingStatusService;
        private readonly BookingStatusController _controller;

        public BookingStatusControllerTest()
        {
            _bookingStatusService = A.Fake<IBookingStatus>();
            _controller = new BookingStatusController(_bookingStatusService);
        }

        [Fact]
        public async Task GetBookingStatuses_ReturnsNotFound_WhenNoBookingStatusesExist()
        {
            // Arrange
            A.CallTo(() => _bookingStatusService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<BookingStatus>>(new List<BookingStatus>()));

            // Act
            var result = await _controller.GetBookingStatuses();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().BeEquivalentTo(new Response(false, "No Booking Status detected"));
        }

        [Fact]
        public async Task GetBookingStatuses_ReturnsOk_WhenBookingStatusesExist()
        {
            // Arrange
            var fakeBookingStatuses = new List<BookingStatus>
            {
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Confirmed" },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Pending" }
            };

            var (_, bookingStatusDTOs) = BookingStatusConversion.FromEntity(null, fakeBookingStatuses);

            A.CallTo(() => _bookingStatusService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<BookingStatus>>(fakeBookingStatuses));

            // Act
            var result = await _controller.GetBookingStatuses();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = okResult.Value.Should().BeAssignableTo<Response>().Subject;

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking Status retrieved successfully!");
            response.Data.Should().BeEquivalentTo(bookingStatusDTOs);
        }
    }
}