using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Presentation.Controllers;

namespace UnitTest.ReservationApi.Controllers
{
    public class ReportBookingControllerTest
    {
        private readonly IReport _report;
        private readonly IBookingStatus _bookingStatus;
        private readonly ReportBookingController _controller;

        public ReportBookingControllerTest()
        {
            _report = A.Fake<IReport>();
            _bookingStatus = A.Fake<IBookingStatus>();
            _controller = new ReportBookingController(_bookingStatus, _report);
        }

        [Fact]
        public async Task GetIncomeEachCustomer_WithTimeFilters_WhenBookingsExist_ReturnsOk()
        {
            // Arrange
            int year = 2024;
            int month = 3;
            DateTime startDate = new DateTime(2024, 3, 1);
            DateTime endDate = new DateTime(2024, 3, 31);

            var fakeData = new List<AccountAmountDTO>
    {
        new AccountAmountDTO(Guid.NewGuid(), 1500),
        new AccountAmountDTO(Guid.NewGuid(), 2300)
    };

            A.CallTo(() => _report.GetIncomeEachCustomer(year, month, startDate, endDate))
                .Returns(Task.FromResult<IEnumerable<AccountAmountDTO>>(fakeData));

            // Act
            var result = await _controller.GetIncomeEachCustomer(year, month, startDate, endDate);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking retrieved successfully!");
            response.Data.Should().BeEquivalentTo(fakeData);
        }

        [Fact]
        public async Task GetIncomeEachCustomer_WithTimeFilters_WhenNoBookingsExist_ReturnsNotFound()
        {
            // Arrange
            int year = 2023;
            int month = 12;
            DateTime startDate = new DateTime(2023, 12, 1);
            DateTime endDate = new DateTime(2023, 12, 31);

            var emptyData = new List<AccountAmountDTO>();

            A.CallTo(() => _report.GetIncomeEachCustomer(year, month, startDate, endDate))
                .Returns(Task.FromResult<IEnumerable<AccountAmountDTO>>(emptyData));

            // Act
            var result = await _controller.GetIncomeEachCustomer(year, month, startDate, endDate);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = Assert.IsType<Response>(notFoundResult.Value);

            response.Flag.Should().BeFalse();
            response.Message.Should().Be("No bookings detected");
        }


        [Fact]
        public async Task GetBookingStatuses_ReturnsNotFound_WhenNoBookingStatusDetected()
        {
            // Arrange
            A.CallTo(() => _report.GetAllBookingStatusIncludeBookingAsync())
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
        new BookingStatus
        {
            BookingStatusId = Guid.NewGuid(),
            BookingStatusName = "Confirmed",
            Bookings = new List<Booking>()
        },
        new BookingStatus
        {
            BookingStatusId = Guid.NewGuid(),
            BookingStatusName = "Pending",
            Bookings = new List<Booking>()
        }
    };

            var (_, bookingStatusDTOs) = ReportBookingConversion.FromEntity(null, fakeBookingStatuses);

            A.CallTo(() => _report.GetAllBookingStatusIncludeBookingAsync())
                .Returns(Task.FromResult<IEnumerable<BookingStatus>>(fakeBookingStatuses));

            // Act
            var result = await _controller.GetBookingStatuses();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking Status retrieved successfully!");
            response.Data.Should().BeEquivalentTo(bookingStatusDTOs);
        }

        [Fact]
        public async Task GetIncome_ReturnsNotFound_WhenNoBookingTypeExists()
        {
            // Arrange
            A.CallTo(() => _report.GetTotalIncomeByBookingTypeAsync(null, null, null, null))
                .Returns(Task.FromResult<IEnumerable<ReportBookingTypeDTO>>(new List<ReportBookingTypeDTO>()));

            // Act
            var result = await _controller.GetIncome(null, null, null, null);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = Assert.IsType<Response>(notFoundResult.Value);

            response.Flag.Should().BeFalse();
            response.Message.Should().Be("No Booking type detected");
        }

        [Fact]
        public async Task GetIncome_WithSpecificYearAndMonth_ReturnsOk()
        {
            // Arrange
            int year = 2024;
            int month = 3;

            var fakeBookingTypes = new List<ReportBookingTypeDTO>
    {
        new ReportBookingTypeDTO("Service", new List<AmountDTO>
        {
            new AmountDTO("March", 1200)
        }),
        new ReportBookingTypeDTO("Hotel", new List<AmountDTO>
        {
            new AmountDTO("March", 2500)
        })
    };

            A.CallTo(() => _report.GetTotalIncomeByBookingTypeAsync(year, month, null, null))
                .Returns(Task.FromResult<IEnumerable<ReportBookingTypeDTO>>(fakeBookingTypes));

            // Act
            var result = await _controller.GetIncome(year, month, null, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking type retrieved successfully!");
            response.Data.Should().BeEquivalentTo(fakeBookingTypes);
        }


    }
}
