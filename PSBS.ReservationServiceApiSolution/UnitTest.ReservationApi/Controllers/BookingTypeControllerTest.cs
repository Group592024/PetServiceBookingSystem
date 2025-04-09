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
    public class BookingTypeControllerTest
    {
        private readonly IBookingType _bookingTypeService;
        private readonly BookingTypeController _controller;

        public BookingTypeControllerTest()
        {
            _bookingTypeService = A.Fake<IBookingType>();
            _controller = new BookingTypeController(_bookingTypeService);
        }

        [Fact]
        public async Task GetBookingTypes_ReturnsNotFound_WhenNoBookingTypesExist()
        {
            // Arrange
            A.CallTo(() => _bookingTypeService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<BookingType>>(new List<BookingType>()));

            // Act
            var result = await _controller.GetbookingTypes();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().BeEquivalentTo(new Response(false, "No Booking Type detected"));
        }

        [Fact]
        public async Task GetBookingTypes_ReturnsOk_WhenBookingTypesExist()
        {
            // Arrange
            var fakeBookingTypes = new List<BookingType>
            {
                new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Hotel" },
                new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Service" }
            };

            var (_, bookingTypeDTOs) = BookingTypeConversion.FromEntity(null, fakeBookingTypes);

            A.CallTo(() => _bookingTypeService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<BookingType>>(fakeBookingTypes));

            // Act
            var result = await _controller.GetbookingTypes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = okResult.Value.Should().BeAssignableTo<Response>().Subject;

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking Type retrieved successfully!");
            response.Data.Should().BeEquivalentTo(bookingTypeDTOs);
        }
    }
}