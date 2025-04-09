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
    public class PointRuleControllerTest
    {
        private readonly IPointRule _pointRuleService;
        private readonly PointRuleController _controller;

        public PointRuleControllerTest()
        {
            _pointRuleService = A.Fake<IPointRule>();
            _controller = new PointRuleController(_pointRuleService);
        }

        [Fact]
        public async Task GetPointRules_ReturnsNotFound_WhenNoPointRulesExist()
        {
            // Arrange
            A.CallTo(() => _pointRuleService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<PointRule>>(new List<PointRule>()));

            // Act
            var result = await _controller.GetPointRules();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().BeEquivalentTo(new Response(false, "No Point Rule detected"));
        }

        [Fact]
        public async Task GetPointRules_ReturnsOk_WhenPointRulesExist()
        {
            // Arrange
            var fakePointRules = new List<PointRule>
            {
                new PointRule
                {
                    PointRuleId = Guid.NewGuid(),
                    PointRuleRatio = 10,
                    isDeleted = false
                },
                new PointRule
                {
                    PointRuleId = Guid.NewGuid(),
                    PointRuleRatio = 20,
                    isDeleted = false
                }
            };

            var (_, pointRuleDTOs) = PointRuleConversion.FromEntity(null, fakePointRules);

            A.CallTo(() => _pointRuleService.GetAllAsync())
                .Returns(Task.FromResult<IEnumerable<PointRule>>(fakePointRules));

            // Act
            var result = await _controller.GetPointRules();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Point Rule retrieved successfully!");
            response.Data.Should().BeEquivalentTo(pointRuleDTOs);
        }

        [Fact]
        public async Task GetPointRuleById_ReturnsNotFound_WhenPointRuleDoesNotExist()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();
            A.CallTo(() => _pointRuleService.GetByIdAsync(nonExistentId))
                .Returns(Task.FromResult<PointRule>(null));

            // Act
            var result = await _controller.GetPointRuleById(nonExistentId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().BeEquivalentTo(new Response(false, "pointRule requested not found"));
        }

        [Fact]
        public async Task GetPointRuleById_ReturnsOk_WhenPointRuleExists()
        {
            // Arrange
            var pointRuleId = Guid.NewGuid();
            var fakePointRule = new PointRule
            {
                PointRuleId = pointRuleId,
                PointRuleRatio = 10,
                isDeleted = false
            };

            var (pointRuleDTO, _) = PointRuleConversion.FromEntity(fakePointRule, null);

            A.CallTo(() => _pointRuleService.GetByIdAsync(pointRuleId))
                .Returns(Task.FromResult(fakePointRule));

            // Act
            var result = await _controller.GetPointRuleById(pointRuleId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("The point Rule retrieved successfully");
            response.Data.Should().BeEquivalentTo(pointRuleDTO);
        }

        [Fact]
        public async Task CreatePointRule_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var invalidPointRule = new PointRuleDTO(Guid.NewGuid(), -1, false); // Invalid ratio
            _controller.ModelState.AddModelError("PointRuleRatio", "Ratio must be positive");

            // Act
            var result = await _controller.CreatePointRule(invalidPointRule);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.IsType<SerializableError>(badRequestResult.Value);
        }

        [Fact]
        public async Task CreatePointRule_ReturnsOk_WhenCreationIsSuccessful()
        {
            // Arrange
            var validPointRule = new PointRuleDTO(Guid.NewGuid(), 10, false);
            var expectedResponse = new Response(true, "Point rule created successfully");

            A.CallTo(() => _pointRuleService.CreateAsync(A<PointRule>._))
                .Returns(Task.FromResult(expectedResponse));

            // Act
            var result = await _controller.CreatePointRule(validPointRule);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            response.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task UpdatePointRule_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var invalidPointRule = new PointRuleDTO(Guid.NewGuid(), -1, false); // Invalid ratio
            _controller.ModelState.AddModelError("PointRuleRatio", "Ratio must be positive");

            // Act
            var result = await _controller.UpdatePointRule(invalidPointRule);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.IsType<SerializableError>(badRequestResult.Value);
        }

        [Fact]
        public async Task UpdatePointRule_ReturnsOk_WhenUpdateIsSuccessful()
        {
            // Arrange
            var validPointRule = new PointRuleDTO(Guid.NewGuid(), 15, false);
            var expectedResponse = new Response(true, "Point rule updated successfully");

            A.CallTo(() => _pointRuleService.UpdateAsync(A<PointRule>._))
                .Returns(Task.FromResult(expectedResponse));

            // Act
            var result = await _controller.UpdatePointRule(validPointRule);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            response.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task DeletePointRule_ReturnsBadRequest_WhenPointRuleDoesNotExist()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();
            A.CallTo(() => _pointRuleService.GetByIdAsync(nonExistentId))
                .Returns(Task.FromResult<PointRule>(null));

            // Act
            var result = await _controller.DeletePointRule(nonExistentId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);

            // Instead of checking exact type, check if it can be assigned to Response
            badRequestResult.Value.Should().BeAssignableTo<Response>();

            var response = (Response)badRequestResult.Value;
            response.Flag.Should().BeFalse();
            
        }
        [Fact]
        public async Task DeletePointRule_ReturnsOk_WhenDeletionIsSuccessful()
        {
            // Arrange
            var pointRuleId = Guid.NewGuid();
            var fakePointRule = new PointRule
            {
                PointRuleId = pointRuleId,
                PointRuleRatio = 10,
                isDeleted = false
            };

            var expectedResponse = new Response(true, "Point rule deleted successfully");

            A.CallTo(() => _pointRuleService.GetByIdAsync(pointRuleId))
                .Returns(Task.FromResult(fakePointRule));

            A.CallTo(() => _pointRuleService.DeleteAsync(fakePointRule))
                .Returns(Task.FromResult(expectedResponse));

            // Act
            var result = await _controller.DeletePointRule(pointRuleId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            response.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task GetPointRuleActive_ReturnsNotFound_WhenNoActivePointRuleExists()
        {
            // Arrange
            A.CallTo(() => _pointRuleService.GetPointRuleActiveAsync())
                .Returns(Task.FromResult<PointRule>(null));

            // Act
            var result = await _controller.GetPointRuleActive();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().BeEquivalentTo(new Response(false, "No Point Rule detected"));
        }

        [Fact]
        public async Task GetPointRuleActive_ReturnsOk_WhenActivePointRuleExists()
        {
            // Arrange
            var fakePointRule = new PointRule
            {
                PointRuleId = Guid.NewGuid(),
                PointRuleRatio = 10,
                isDeleted = false
            };

            var (pointRuleDTO, _) = PointRuleConversion.FromEntity(fakePointRule, null);

            A.CallTo(() => _pointRuleService.GetPointRuleActiveAsync())
                .Returns(Task.FromResult(fakePointRule));

            // Act
            var result = await _controller.GetPointRuleActive();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Point Rule retrieved successfully!");
            response.Data.Should().BeEquivalentTo(pointRuleDTO);
        }
    }
}