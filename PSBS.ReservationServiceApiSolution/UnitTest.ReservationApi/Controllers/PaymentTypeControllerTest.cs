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
    public class PaymentTypeControllerTest
    {
        private readonly IPaymentType _paymentTypeService;
        private readonly PaymentTypeController _controller;

        public PaymentTypeControllerTest()
        {
            _paymentTypeService = A.Fake<IPaymentType>();
            _controller = new PaymentTypeController(_paymentTypeService);
        }

        [Fact]
        public async Task GetPaymentTypes_ReturnsNotFound_WhenNoPaymentTypesExist()
        {
            // Arrange
            A.CallTo(() => _paymentTypeService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<PaymentType>>(new List<PaymentType>()));

            // Act
            var result = await _controller.GetpaymentTypes();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().BeEquivalentTo(new Response(false, "No Payment Type detected"));
        }

        [Fact]
        public async Task GetPaymentTypes_ReturnsOk_WhenPaymentTypesExist()
        {
            // Arrange
            var fakePaymentTypes = new List<PaymentType>
            {
                new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Credit Card" },
                new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "Cash" }
            };

            var (_, paymentTypeDTOs) = PaymentTypeConversion.FromEntity(null, fakePaymentTypes);

            A.CallTo(() => _paymentTypeService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<PaymentType>>(fakePaymentTypes));

            // Act
            var result = await _controller.GetpaymentTypes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = okResult.Value.Should().BeAssignableTo<Response>().Subject;

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Payment Type retrieved successfully!");
            response.Data.Should().BeEquivalentTo(paymentTypeDTOs);
        }
    }
}