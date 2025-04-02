using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.Interfaces;
using PetApi.Infrastructure.Service;
using PetApi.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.PetServiceApi.Controllers
{
    public class ReportPetControllerTest
    {
        private readonly IReport _report;
        private readonly ReportPetController _controller;
        private readonly FacilityApiClient _facilityApiClient;
        private readonly Guid _validId = Guid.NewGuid();
        private readonly string _fakeToken = "fake-jwt-token";
        public ReportPetControllerTest()
        {
            _report = A.Fake<IReport>();
            _facilityApiClient = A.Fake<FacilityApiClient>();
            _controller = new ReportPetController(_report, _facilityApiClient);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = "Bearer " + _fakeToken;
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        [Fact]
        public async Task GetPetCount_ReturnsNotFound_WhenFacilityServiceReturnsNull()
        {
            // Arrange
            A.CallTo(() => _facilityApiClient.GetPetCount(_validId, _fakeToken, null, null, null, null))
                .Returns(Task.FromResult<IEnumerable<PetCountDTO>>(null!));

            // Act
            var result = await _controller.getPetCount(_validId, null, null, null, null);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().Be("Error when getting pet count from Facility Service or No pet count dto found");
        }

        [Fact]
        public async Task GetPetCount_ReturnsNotFound_WhenNoPetBreedCountFound()
        {
            // Arrange
            var fakePetCountDto = new List<PetCountDTO>
        {
            new PetCountDTO (_validId, 5 )
        };

            A.CallTo(() => _facilityApiClient.GetPetCount(_validId, _fakeToken, null, null, null, null))
                .Returns(Task.FromResult<IEnumerable<PetCountDTO>>(fakePetCountDto));

            A.CallTo(() => _report.GetPetBreedByPetCoutDTO(fakePetCountDto))
                .Returns(Task.FromResult<Dictionary<string, int>>(null!));

            // Act
            var result = await _controller.getPetCount(_validId, null, null, null, null);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            notFoundResult.Value.Should().BeEquivalentTo(new Response(false, "No pet breed count found"));
        }

        [Fact]
        public async Task GetPetCount_ReturnsOk_WhenPetBreedCountIsFound()
        {
            // Arrange
            var fakeYear = 2024;
            var fakeMonth = 3;
            var fakeStartDate = new DateTime(2024, 3, 1);
            var fakeEndDate = new DateTime(2024, 3, 31);

            var fakePetCountDto = new List<PetCountDTO>
    {
        new PetCountDTO(_validId, 5)
    };

            var fakeBreedCount = new Dictionary<string, int>
    {
        { "Labrador", 5 }
    };

            A.CallTo(() => _facilityApiClient.GetPetCount(_validId, _fakeToken, fakeYear, fakeMonth, fakeStartDate, fakeEndDate))
                .Returns(Task.FromResult<IEnumerable<PetCountDTO>>(fakePetCountDto));

            A.CallTo(() => _report.GetPetBreedByPetCoutDTO(fakePetCountDto))
                .Returns(Task.FromResult(fakeBreedCount));

            // Act
            var result = await _controller.getPetCount(_validId, fakeYear, fakeMonth, fakeStartDate, fakeEndDate);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Pet breed counted successfully");
            response.Data.Should().BeEquivalentTo(fakeBreedCount);
        }



    }


}