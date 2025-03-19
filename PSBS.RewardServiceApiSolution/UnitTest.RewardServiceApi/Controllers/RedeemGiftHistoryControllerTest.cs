
using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Application.DTOs.Conversions;
using VoucherApi.Application.Interfaces;
using VoucherApi.Domain.Entities;
using VoucherApi.Infrastructure.Data;
using VoucherApi.Infrastructure.Repositories;
using VoucherApi.Presentation.Controllers;

namespace UnitTest.RewardServiceApi.Controllers
{
    public class RedeemGiftHistoryControllerTest
    {
        private readonly IRedeemGiftHistory redeemHistoryInterface;
        private readonly RedeemGiftHistoryController redeemGiftHistoryController;

        public RedeemGiftHistoryControllerTest()
        {
            // set up dependecies
            redeemHistoryInterface = A.Fake<IRedeemGiftHistory>();
            // set up System Under Test 
            redeemGiftHistoryController = new RedeemGiftHistoryController(redeemHistoryInterface);

        }

        [Fact]
        public async Task CreateRedeemHistory_ValidModel_ReturnOK()
        {
            // Arrange
            var redeemGiftHistory = new RedeemGiftHistory
            {
                RedeemHistoryId = Guid.NewGuid(),
                GiftId = Guid.NewGuid(),
                ReddeemStautsId = Guid.NewGuid(),
                AccountId = Guid.NewGuid(),
                RedeemPoint = 100,
                RedeemDate = DateTime.Now
            };
            var response = new Response(true, "Gift redemption completed successfully");
            A.CallTo(() => redeemHistoryInterface.AddRedeemGiftHistory(redeemGiftHistory)).Returns(Task.FromResult(response));

            // Act
            var result = await redeemGiftHistoryController.CreateRedeemHistory(redeemGiftHistory);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task GetCustomerRedeemHistory_WhenHistoryExists_ReturnOK()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var redeemStatus1 = new RedeemStatus { ReddeemStautsId = Guid.NewGuid(), RedeemName = "Status 1" };
            var redeemStatus2 = new RedeemStatus { ReddeemStautsId = Guid.NewGuid(), RedeemName = "Status 2" };
            var gift1 = new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 1" };
            var gift2 = new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 2" };

            var history = new List<RedeemGiftHistory>
            {
                new RedeemGiftHistory
                {
                    RedeemHistoryId = Guid.NewGuid(),
                    GiftId = gift1.GiftId,
                    ReddeemStautsId = redeemStatus1.ReddeemStautsId,
                    AccountId = accountId,
                    RedeemPoint = 100,
                    RedeemDate = DateTime.Now,
                    RedeemStatus = redeemStatus1,
                    Gift = gift1 // Include the Gift
                },
                new RedeemGiftHistory
                {
                    RedeemHistoryId = Guid.NewGuid(),
                    GiftId = gift2.GiftId,
                    ReddeemStautsId = redeemStatus2.ReddeemStautsId,
                    AccountId = accountId,
                    RedeemPoint = 150,
                    RedeemDate = DateTime.Now.AddDays(-1),
                    RedeemStatus = redeemStatus2,
                    Gift = gift2 // Include the Gift
                }
            };
            A.CallTo(() => redeemHistoryInterface.GetCustomerRedeemHistory(accountId)).Returns(Task.FromResult(history));

            // Act
            var result = await redeemGiftHistoryController.GetCustomerRedeemHistory(accountId);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
           
        }

        [Fact]
        public async Task GetAllRedeemHistories_WhenHistoryExists_ReturnOK()
        {
            // Arrange
            var redeemStatus1 = new RedeemStatus { ReddeemStautsId = Guid.NewGuid(), RedeemName = "Status 1" };
            var redeemStatus2 = new RedeemStatus { ReddeemStautsId = Guid.NewGuid(), RedeemName = "Status 2" };
            var gift1 = new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 1" };
            var gift2 = new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 2" };

            var history = new List<RedeemGiftHistory>
            {
                new RedeemGiftHistory
                {
                    RedeemHistoryId = Guid.NewGuid(),
                    GiftId = gift1.GiftId,
                    ReddeemStautsId = redeemStatus1.ReddeemStautsId,
                    AccountId = Guid.NewGuid(),
                    RedeemPoint = 100,
                    RedeemDate = DateTime.Now,
                    RedeemStatus = redeemStatus1,
                    Gift = gift1 // Include the Gift
                },
                new RedeemGiftHistory
                {
                    RedeemHistoryId = Guid.NewGuid(),
                    GiftId = gift2.GiftId,
                    ReddeemStautsId = redeemStatus2.ReddeemStautsId,
                    AccountId = Guid.NewGuid(),
                    RedeemPoint = 150,
                    RedeemDate = DateTime.Now.AddDays(-1),
                    RedeemStatus = redeemStatus2,
                    Gift = gift2 // Include the Gift
                }
            };
            A.CallTo(() => redeemHistoryInterface.GetAllRedeemHistories()).Returns(Task.FromResult(history));

            // Act
            var result = await redeemGiftHistoryController.GetAllRedeemHistories();

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
          
        }
        [Fact]
        public async Task UpdateRedeemStatus_ReturnOK()
        {
            // Arrange
            var redeemId = Guid.NewGuid();
            var statusId = Guid.NewGuid();
            var response = new Response(true, "Redeem status updated successfully.");
            A.CallTo(() => redeemHistoryInterface.UpdateRedeemStatus(redeemId, statusId)).Returns(Task.FromResult(response));

            // Act
            var result = await redeemGiftHistoryController.UpdateRedeemStatus(redeemId, statusId);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task CustomerCancel_ValidRedeem_ReturnOK()
        {
            // Arrange
            var redeemId = Guid.NewGuid();
            var response = new Response(true, "Redeem status updated successfully.");
            A.CallTo(() => redeemHistoryInterface.CustomerCancelRedeem(redeemId)).Returns(Task.FromResult(response));

            // Act
            var result = await redeemGiftHistoryController.CustomerCancel(redeemId);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task CreateRedeemHistory_GiftNotFound_ReturnBadRequest()
        {
            var redeemGiftHistory = new RedeemGiftHistory
            {
                RedeemHistoryId = Guid.NewGuid(),
                GiftId = Guid.NewGuid(),
                ReddeemStautsId = Guid.NewGuid(),
                AccountId = Guid.NewGuid(),
                RedeemPoint = 100,
                RedeemDate = DateTime.Now
            };
            var response = new Response(false, "The gift does not exist to redeem");
            A.CallTo(() => redeemHistoryInterface.AddRedeemGiftHistory(redeemGiftHistory)).Returns(Task.FromResult(response));

            var result = await redeemGiftHistoryController.CreateRedeemHistory(redeemGiftHistory);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task CreateRedeemHistory_GiftOutOfStock_ReturnBadRequest()
        {
            var redeemGiftHistory = new RedeemGiftHistory
            {
                RedeemHistoryId = Guid.NewGuid(),
                GiftId = Guid.NewGuid(),
                ReddeemStautsId = Guid.NewGuid(),
                AccountId = Guid.NewGuid(),
                RedeemPoint = 100,
                RedeemDate = DateTime.Now
            };
            var response = new Response(false, "The gift is out of stock");
            A.CallTo(() => redeemHistoryInterface.AddRedeemGiftHistory(redeemGiftHistory)).Returns(Task.FromResult(response));

            var result = await redeemGiftHistoryController.CreateRedeemHistory(redeemGiftHistory);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task CreateRedeemHistory_DuplicateRedeemAttempt_ReturnBadRequest()
        {
            var redeemGiftHistory = new RedeemGiftHistory
            {
                RedeemHistoryId = Guid.NewGuid(),
                GiftId = Guid.NewGuid(),
                ReddeemStautsId = Guid.NewGuid(),
                AccountId = Guid.NewGuid(),
                RedeemPoint = 100,
                RedeemDate = DateTime.Now
            };
            var response = new Response(false, "Cannot redeem this gift");
            A.CallTo(() => redeemHistoryInterface.AddRedeemGiftHistory(redeemGiftHistory)).Returns(Task.FromResult(response));

            var result = await redeemGiftHistoryController.CreateRedeemHistory(redeemGiftHistory);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task UpdateRedeemStatus_RedeemHistoryNotFound_ReturnBadRequest()
        {
            var redeemId = Guid.NewGuid();
            var statusId = Guid.NewGuid();
            var response = new Response(false, "Redeem history not found.");
            A.CallTo(() => redeemHistoryInterface.UpdateRedeemStatus(redeemId, statusId)).Returns(Task.FromResult(response));

            var result = await redeemGiftHistoryController.UpdateRedeemStatus(redeemId, statusId);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task UpdateRedeemStatus_InvalidStatusUpdate_ReturnBadRequest()
        {
            var redeemId = Guid.NewGuid();
            var statusId = Guid.NewGuid();
            var response = new Response(false, "Cannot update status for Canceled Redeem or Picked up at Store statuses.");
            A.CallTo(() => redeemHistoryInterface.UpdateRedeemStatus(redeemId, statusId)).Returns(Task.FromResult(response));

            var result = await redeemGiftHistoryController.UpdateRedeemStatus(redeemId, statusId);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task CustomerCancel_RedeemHistoryNotFound_ReturnBadRequest()
        {
            var redeemId = Guid.NewGuid();
            var response = new Response(false, "Redeem history not found.");
            A.CallTo(() => redeemHistoryInterface.CustomerCancelRedeem(redeemId)).Returns(Task.FromResult(response));

            var result = await redeemGiftHistoryController.CustomerCancel(redeemId);

            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }
        [Fact]
        public async Task GetRedeemStatuses_NoStatusesFound_ReturnNotFound()
        {
            A.CallTo(() => redeemHistoryInterface.GetRedeemStatuses()).Returns(Task.FromResult(Enumerable.Empty<RedeemStatus>()));

            var result = await redeemGiftHistoryController.GetAllStatuses();

            var notFoundResult = result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }
    }
}
