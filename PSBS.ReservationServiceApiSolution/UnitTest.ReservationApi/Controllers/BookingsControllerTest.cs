using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Presentation.Controllers;
using System.Net.Http.Headers;
using VNPAY.NET;
using VNPAY.NET.Models;
using Xunit;

namespace UnitTest.ReservationApi.Controllers
{
    public class BookingsControllerTest
    {
        private readonly IBooking _bookingService;
        private readonly IVnpay _vnpayService;
        private readonly IConfiguration _configuration;
        private readonly IPointRule _pointRuleService;
        private readonly BookingsController _controller;
        private readonly DbContextOptions<ReservationServiceDBContext> _dbContextOptions;

        public BookingsControllerTest()
        {
            // Create in-memory database options
            _dbContextOptions = new DbContextOptionsBuilder<ReservationServiceDBContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            // Create fake services
            _bookingService = A.Fake<IBooking>();
            _vnpayService = A.Fake<IVnpay>();
            _configuration = A.Fake<IConfiguration>();
            _pointRuleService = A.Fake<IPointRule>();

            // Mock configuration values needed for Vnpay initialization
            A.CallTo(() => _configuration["Vnpay:TmnCode"]).Returns("TestTmnCode");
            A.CallTo(() => _configuration["Vnpay:HashSecret"]).Returns("TestHashSecret");
            A.CallTo(() => _configuration["Vnpay:BaseUrl"]).Returns("https://test.vnpay.vn");
            A.CallTo(() => _configuration["Vnpay:CallbackUrl"]).Returns("https://test.callback.url");

            // Create controller with real DbContext but in-memory database
            using var context = new ReservationServiceDBContext(_dbContextOptions);
            _controller = new BookingsController(
                _bookingService,
                context,
                _vnpayService,
                _configuration,
                _pointRuleService);
        }

        [Fact]
        public async Task GetBookingsForAdmin_WhenBookingsExist_ReturnsOkResponse()
        {
            // Arrange
            var bookings = new List<Booking>
            {
                new Booking { BookingId = Guid.NewGuid(), BookingCode = "ORD-123456", AccountId = Guid.NewGuid() },
                new Booking { BookingId = Guid.NewGuid(), BookingCode = "ORD-654321", AccountId = Guid.NewGuid() }
            };

            A.CallTo(() => _bookingService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Booking>>(bookings));

            // Act
            var result = await _controller.GetBookingsForAdmin();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Bookings retrieved successfully!");
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetBookingsForAdmin_WhenNoBookingsExist_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _bookingService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Booking>>(new List<Booking>()));

            // Act
            var result = await _controller.GetBookingsForAdmin();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No bookings detected");
        }

        [Fact]
        public async Task GetBookingsForUser_WhenBookingsExist_ReturnsOkResponse()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var bookings = new List<Booking>
            {
                new Booking { BookingId = Guid.NewGuid(), BookingCode = "ORD-123456", AccountId = userId },
                new Booking { BookingId = Guid.NewGuid(), BookingCode = "ORD-654321", AccountId = userId }
            };

            A.CallTo(() => _bookingService.GetAllBookingForUserAsync(userId)).Returns(Task.FromResult<IEnumerable<Booking>>(bookings));

            // Act
            var result = await _controller.GetBookingsForUser(userId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Bookings retrieved successfully!");
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetBookingsForUser_WhenNoBookingsExist_ReturnsNotFound()
        {
            // Arrange
            var userId = Guid.NewGuid();
            A.CallTo(() => _bookingService.GetAllBookingForUserAsync(userId)).Returns(Task.FromResult<IEnumerable<Booking>>(new List<Booking>()));

            // Act
            var result = await _controller.GetBookingsForUser(userId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No bookings detected");
        }

        [Fact]
        public async Task GetBookingByIdForAdmin_WhenBookingExists_ReturnsOkResponse()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var booking = new Booking
            {
                BookingId = bookingId,
                BookingCode = "ORD-123456",
                AccountId = Guid.NewGuid()
            };

            A.CallTo(() => _bookingService.GetByIdAsync(bookingId)).Returns(Task.FromResult(booking));

            // Act
            var result = await _controller.GetBookingByIdForAdmin(bookingId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("The booking retrieved successfully");
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetBookingByIdForAdmin_WhenBookingDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            A.CallTo(() => _bookingService.GetByIdAsync(bookingId)).Returns(Task.FromResult<Booking>(null));

            // Act
            var result = await _controller.GetBookingByIdForAdmin(bookingId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("The room requested not found");
        }

        [Fact]
        public async Task CreateBooking_WithValidData_ReturnsOkResponse()
        {
            // Arrange
            var addBookingDto = new AddBookingDTO(
                AccountId: Guid.NewGuid(),
                PaymentTypeId: Guid.NewGuid(),
                VoucherId: null,
                BookingTypeId: Guid.NewGuid(),
                BookingStatusId: Guid.NewGuid(),
                PointRuleId: Guid.Empty,
                TotalAmount: 100,
                Notes: "Test booking"
            );

            var bookingResponse = new Response(true, "Create Booking successfully")
            {
                Data = new BookingResponseDTO { BookingId = Guid.NewGuid() }
            };

            A.CallTo(() => _bookingService.CreateAsync(A<Booking>.Ignored)).Returns(Task.FromResult(bookingResponse));

            // Act
            var result = await _controller.CreateBooking(addBookingDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Create Booking successfully");
        }

        [Fact]
        public async Task CreateBooking_WithInvalidModel_ReturnsBadRequest()
        {
            // Arrange
            _controller.ModelState.AddModelError("AccountId", "Account ID is required");
            var addBookingDto = new AddBookingDTO(
                AccountId: Guid.Empty,
                PaymentTypeId: Guid.NewGuid(),
                VoucherId: null,
                BookingTypeId: Guid.NewGuid(),
                BookingStatusId: Guid.NewGuid(),
                PointRuleId: Guid.Empty,
                TotalAmount: 100,
                Notes: "Test booking"
            );

            // Act
            var result = await _controller.CreateBooking(addBookingDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Input invalid");
        }

        [Fact]
        public async Task CancelBooking_WhenBookingExists_ReturnsOkResponse()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var successResponse = new Response(true, "Cancel booking successfully!");

            A.CallTo(() => _bookingService.CancelBookingAsync(bookingId)).Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.CancelBooking(bookingId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Cancel booking successfully!");
        }

        [Fact]
        public async Task CancelBooking_WhenBookingDoesNotExist_ReturnsBadRequest()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var failureResponse = new Response(false, "No detected any booking.");

            A.CallTo(() => _bookingService.CancelBookingAsync(bookingId)).Returns(Task.FromResult(failureResponse));

            // Act
            var result = await _controller.CancelBooking(bookingId);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No detected any booking.");
        }

    }
}