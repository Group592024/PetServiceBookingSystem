using FakeItEasy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VoucherApi.Application.DTOs.GiftDTOs;
using VoucherApi.Application.Interfaces;
using VoucherApi.Domain.Entities;
using VoucherApi.Presentation.Controllers;
using FluentAssertions;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.RewardServiceApi.Controllers
{
    public class GiftsControllerTest
    {
        private readonly IGift _giftInterface;
        private readonly GiftsController _giftsController;

        public GiftsControllerTest()
        {
            // Set up dependencies
            _giftInterface = A.Fake<IGift>();
            // Set up System Under Test 
            _giftsController = new GiftsController(_giftInterface);
        }

        // GET ALL GIFTS FOR CUSTOMER
        [Fact]
        public async Task GetGiftsListForCustomer_WhenGiftsExist_ReturnOKResWithGifts()
        {
            // Arrange 
            var gifts = new List<Gift>()
            {
                new()
                {
                    GiftId = Guid.NewGuid(),
                    GiftName = "Gift 1",
                    GiftDescription = "Description 1",
                    GiftPoint = 100,
                    GiftCode = "GIFT1",
                    GiftStatus = false
                },
                new()
                {
                    GiftId = Guid.NewGuid(),
                    GiftName = "Gift 2",
                    GiftDescription = "Description 2",
                    GiftPoint = 200,
                    GiftCode = "GIFT2",
                    GiftStatus = false
                }
            };

            A.CallTo(() => _giftInterface.GetGiftListForCustomerAsync()).Returns(gifts);

            // Act
            var result = await _giftsController.GetGiftsListForCustomer();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var returnedResponse = okResult.Value as Response;
            returnedResponse.Should().NotBeNull();
            returnedResponse!.Flag.Should().BeTrue();
            returnedResponse.Message.Should().Be("Gifts retrieved successfully!");
        }

        [Fact]
        public async Task GetGiftsListForCustomer_WhenGiftsDoNotExist_ReturnNotFound()
        {
            // Arrange
            A.CallTo(() => _giftInterface.GetGiftListForCustomerAsync()).Returns(new List<Gift>());

            // Act
            var result = await _giftsController.GetGiftsListForCustomer();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        // GET ALL GIFTS FOR ADMIN
        [Fact]
        public async Task GetGiftsListWithAdminFormat_WhenGiftsExist_ReturnOKResWithGifts()
        {
            // Arrange 
            var gifts = new List<Gift>()
            {
                new()
                {
                    GiftId = Guid.NewGuid(),
                    GiftName = "Gift 1",
                    GiftImage = "/images/gift1.jpg",
                    GiftCode = "GIFT1",
                    GiftStatus = false
                },
                new()
                {
                    GiftId = Guid.NewGuid(),
                    GiftName = "Gift 2",
                    GiftImage = "/images/gift2.jpg",
                    GiftCode = "GIFT2",
                    GiftStatus = true
                }
            };

            A.CallTo(() => _giftInterface.GetAllAsync()).Returns(gifts);

            // Act
            var result = await _giftsController.GetGiftsListWithAdminFormat();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var returnedResponse = okResult.Value as Response;
            returnedResponse.Should().NotBeNull();
            returnedResponse!.Flag.Should().BeTrue();
            returnedResponse.Message.Should().Be("Gifts retrieved successfully!");
        }

        [Fact]
        public async Task GetGiftsListWithAdminFormat_WhenGiftsDoNotExist_ReturnNotFound()
        {
            // Arrange
            A.CallTo(() => _giftInterface.GetAllAsync()).Returns(new List<Gift>());

            // Act
            var result = await _giftsController.GetGiftsListWithAdminFormat();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        // GET GIFT BY ID (ADMIN)
        [Fact]
        public async Task GetGiftById_WhenGiftExists_ReturnOKResWithGift()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            var gift = new Gift
            {
                GiftId = giftId,
                GiftName = "Test Gift",
                GiftDescription = "Test Description",
                GiftPoint = 100,
                GiftCode = "TESTGIFT",
                GiftStatus = false
            };

            A.CallTo(() => _giftInterface.GetByIdAsync(giftId)).Returns(gift);

            // Act
            var result = await _giftsController.GetGiftById(giftId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var returnedResponse = okResult.Value as Response;
            returnedResponse.Should().NotBeNull();
            returnedResponse!.Flag.Should().BeTrue();
            returnedResponse.Message.Should().Be("The gift retrieved successfully");
        }

        [Fact]
        public async Task GetGiftById_WhenGiftDoesNotExist_ReturnNotFound()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            A.CallTo(() => _giftInterface.GetByIdAsync(giftId)).Returns(Task.FromResult<Gift>(null));

            // Act
            var result = await _giftsController.GetGiftById(giftId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        // GET GIFT BY ID (CUSTOMER)
        [Fact]
        public async Task GetGiftByIdForCustomer_WhenGiftExists_ReturnOKResWithGift()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            var gift = new Gift
            {
                GiftId = giftId,
                GiftName = "Test Gift",
                GiftDescription = "Test Description",
                GiftPoint = 100,
                GiftCode = "TESTGIFT",
                GiftStatus = false
            };

            A.CallTo(() => _giftInterface.GetGiftDetailForCustomerAsync(giftId)).Returns(gift);

            // Act
            var result = await _giftsController.GetGiftByIdForCustomer(giftId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var returnedResponse = okResult.Value as Response;
            returnedResponse.Should().NotBeNull();
            returnedResponse!.Flag.Should().BeTrue();
            returnedResponse.Message.Should().Be("The gift retrieved successfully");
        }

        [Fact]
        public async Task GetGiftByIdForCustomer_WhenGiftDoesNotExist_ReturnNotFound()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            A.CallTo(() => _giftInterface.GetGiftDetailForCustomerAsync(giftId)).Returns(Task.FromResult<Gift>(null));

            // Act
            var result = await _giftsController.GetGiftByIdForCustomer(giftId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        // CREATE GIFT
        [Fact]
        public async Task CreateGift_ValidModel_ReturnOK()
        {
            // Arrange
            var giftDto = new GiftDTO(
                Guid.NewGuid(),
                "Test Gift",
                "Test Description",
                null,
                A.Fake<IFormFile>(),
                100,
                "TESTGIFT",
                10
            );

            var expectedResponse = new Response(true, "Gift created successfully");
            A.CallTo(() => _giftInterface.CreateAsync(A<Gift>._)).Returns(expectedResponse);
            _giftsController.ModelState.Clear();

            // Act
            var actionResult = await _giftsController.CreateGift(giftDto);

            // Assert
            actionResult.Should().NotBeNull();

            // For ActionResult<T>, we need to check the Result property
            var result = actionResult.Result as OkObjectResult;
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = result.Value as Response;
            response.Should().NotBeNull();
            response.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task CreateGift_InvalidModel_ReturnBadRequest()
        {
            // Arrange
            var giftDto = new GiftDTO(
                Guid.NewGuid(),
                null, 
                "Test Description",
                null,
                null, 
                0,  
                "TESTGIFT",
                10
            );

            _giftsController.ModelState.AddModelError("GiftName", "GiftName is required");
            _giftsController.ModelState.AddModelError("imageFile", "Please upload a image for gift");
            _giftsController.ModelState.AddModelError("giftPoint", "Please enter the point greater than 0.");

            // Act
            var result = await _giftsController.CreateGift(giftDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

        // UPDATE GIFT
        [Fact]
        public async Task UpdateGift_ValidModel_ReturnOK()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            var updateGiftDto = new UpdateGiftDTO(
                giftId,
                "Updated Gift",
                "Updated Description",
                null,
                A.Fake<IFormFile>(),
                150,
                "UPDATEDGIFT",
                15,
                false
            );

            var existingGift = new Gift { GiftId = giftId };

            A.CallTo(() => _giftInterface.GetByIdAsync(giftId)).Returns(existingGift);
            A.CallTo(() => _giftInterface.UpdateAsync(A<Gift>._)).Returns(new Response(true, "Gift updated successfully"));
            _giftsController.ModelState.Clear();

            // Act
            var result = await _giftsController.UpdateGift(updateGiftDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task UpdateGift_InvalidModel_ReturnBadRequest()
        {
            // Arrange
            var updateGiftDto = new UpdateGiftDTO(
                Guid.Empty, // Invalid ID
                null, // Invalid - name is required
                "Updated Description",
                null,
                null,
                0, // Invalid - point must be > 0
                "UPDATEDGIFT",
                15,
                false
            );

            _giftsController.ModelState.AddModelError("giftId", "The ID is invalid.");
            _giftsController.ModelState.AddModelError("GiftName", "GiftName is required");
            _giftsController.ModelState.AddModelError("giftPoint", "Please enter the point greater than 0.");

            // Act
            var result = await _giftsController.UpdateGift(updateGiftDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

        [Fact]
        public async Task UpdateGift_WhenGiftDoesNotExist_ReturnNotFound()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            var updateGiftDto = new UpdateGiftDTO(
                giftId,
                "Updated Gift",
                "Updated Description",
                null,
                null,
                150,
                "UPDATEDGIFT",
                15,
                false
            );

            A.CallTo(() => _giftInterface.GetByIdAsync(giftId)).Returns(Task.FromResult<Gift>(null));

            // Act
            var result = await _giftsController.UpdateGift(updateGiftDto);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        // DELETE GIFT
        [Fact]
        public async Task DeleteGift_WhenGiftExistsAndGiftStatusIsFalse_ReturnOK()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            var existingGift = new Gift { GiftId = giftId, GiftStatus = false };
            var expectedResponse = new Response(true, "Gift is inactive successfully");

            A.CallTo(() => _giftInterface.GetByIdAsync(giftId)).Returns(existingGift);
            A.CallTo(() => _giftInterface.DeleteAsync(existingGift)).Returns(expectedResponse);

            // Act
            var actionResult = await _giftsController.DeleteGift(giftId);

            // Assert
            actionResult.Should().NotBeNull();

            // Handle both possible return patterns
            var response = actionResult.Value ?? (actionResult.Result as OkObjectResult)?.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Gift is inactive successfully");
        }


        [Fact]
        public async Task DeleteGift_WhenGiftDoesNotExist_ReturnNotFound()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            A.CallTo(() => _giftInterface.GetByIdAsync(giftId)).Returns(Task.FromResult<Gift>(null));

            // Act
            var result = await _giftsController.DeleteGift(giftId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }
    }
}
