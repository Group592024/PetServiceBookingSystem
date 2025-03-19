using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;

namespace PSBS.HealthCareApi.Tests.Controllers
{
    public class TreatmentControllerTests
    {
        private readonly ITreatment _treatmentService;
        private readonly TreatmentController _controller;

        public TreatmentControllerTests()
        {
            _treatmentService = A.Fake<ITreatment>();
            _controller = new TreatmentController(_treatmentService);
        }

        [Fact]
        public async Task GetTreatments_WhenTreatmentsExist_ReturnsOkResponseWithData()
        {
            // Arrange
            var treatments = new List<Treatment>
            {
                new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Vaccination", isDeleted = false },
                new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Surgery", isDeleted = false }
            };

            A.CallTo(() => _treatmentService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Treatment>>(treatments));

            // Act
            var result = await _controller.GetTreatments();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Treatments retrieved successfully");

            var returnedTreatments = response.Data as IEnumerable<TreatmentDTO>;
            returnedTreatments.Should().NotBeNull();
            returnedTreatments!.Count().Should().Be(2);
        }

        [Fact]
        public async Task GetTreatments_WhenNoTreatmentsExist_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _treatmentService.GetAllAsync()).Returns(Task.FromResult<IEnumerable<Treatment>>(new List<Treatment>()));

            // Act
            var result = await _controller.GetTreatments();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No treatments found in the database");
        }

        [Fact]
        public async Task GetTreatmentById_WhenTreatmentExists_ReturnsOkResponse()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            var treatment = new Treatment
            {
                treatmentId = treatmentId,
                treatmentName = "Dental Cleaning",
                isDeleted = false
            };

            A.CallTo(() => _treatmentService.GetByIdAsync(treatmentId)).Returns(Task.FromResult(treatment));

            // Act
            var result = await _controller.GetTreatmentById(treatmentId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Treatment retrieved successfully");

            var returnedTreatment = response.Data as TreatmentDTO;
            returnedTreatment.Should().NotBeNull();
            returnedTreatment!.treatmentId.Should().Be(treatmentId);
            returnedTreatment.treatmentName.Should().Be("Dental Cleaning");
        }

        [Fact]
        public async Task GetTreatmentById_WhenTreatmentDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            A.CallTo(() => _treatmentService.GetByIdAsync(treatmentId)).Returns(Task.FromResult<Treatment>(null));

            // Act
            var result = await _controller.GetTreatmentById(treatmentId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Contain(treatmentId.ToString());
        }

        [Fact]
        public async Task CreateTreatment_WithValidData_ReturnsOkResponse()
        {
            // Arrange
            var treatmentDto = new TreatmentDTO
            {
                treatmentName = "Grooming",
                isDeleted = false
            };

            var treatmentEntity = new Treatment
            {
                treatmentId = Guid.NewGuid(),
                treatmentName = treatmentDto.treatmentName,
                isDeleted = false
            };

            var successResponse = new Response(true, "Treatment created successfully");

            A.CallTo(() => _treatmentService.CreateAsync(A<Treatment>.That.Matches(t =>
                t.treatmentName == treatmentDto.treatmentName &&
                t.isDeleted == treatmentDto.isDeleted)))
            .Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.CreateTreatment(treatmentDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task CreateTreatment_WithInvalidData_ReturnsBadRequest()
        {
            // Arrange
            var treatmentDto = new TreatmentDTO(); // Empty DTO
            _controller.ModelState.AddModelError("treatmentName", "Treatment name is required");

            // Act
            var result = await _controller.CreateTreatment(treatmentDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Invalid input");
        }

        [Fact]
        public async Task CreateTreatment_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var treatmentDto = new TreatmentDTO
            {
                treatmentName = "Grooming",
                isDeleted = false
            };

            var treatmentEntity = new Treatment
            {
                treatmentName = "Grooming",
                isDeleted = false
            };

            var failureResponse = new Response(false, "Failed to create treatment");

            A.CallTo(() => _treatmentService.CreateAsync(treatmentEntity)).Returns(Task.FromResult(failureResponse));

            // Act
            var result = await _controller.CreateTreatment(treatmentDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateTreatment_WithValidData_ReturnsOkResponse()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            var treatmentDto = new TreatmentDTO
            {
                treatmentId = treatmentId,
                treatmentName = "Updated Treatment",
                isDeleted = false
            };

            var treatmentEntity = new Treatment
            {
                treatmentId = treatmentDto.treatmentId,
                treatmentName = treatmentDto.treatmentName,
                isDeleted = false
            };

            var successResponse = new Response(true, "Treatment updated successfully");

            A.CallTo(() => _treatmentService.UpdateAsync(A<Treatment>.That.Matches(t =>
                t.treatmentId == treatmentDto.treatmentId &&
                t.treatmentName == treatmentDto.treatmentName &&
                t.isDeleted == treatmentDto.isDeleted)))
            .Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.UpdateTreatment(treatmentDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task UpdateTreatment_WithInvalidData_ReturnsBadRequest()
        {
            // Arrange
            var treatmentDto = new TreatmentDTO(); // Empty DTO
            _controller.ModelState.AddModelError("treatmentName", "Treatment name is required");

            // Act
            var result = await _controller.UpdateTreatment(treatmentDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Invalid input");
        }

        [Fact]
        public async Task UpdateTreatment_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            var treatmentDto = new TreatmentDTO
            {
                treatmentId = treatmentId,
                treatmentName = "Updated Treatment",
                isDeleted = false
            };

            var treatmentEntity = new Treatment
            {
                treatmentId = treatmentId,
                treatmentName = "Updated Treatment",
                isDeleted = false
            };

            var failureResponse = new Response(false, "Failed to update treatment");

            A.CallTo(() => _treatmentService.UpdateAsync(treatmentEntity)).Returns(Task.FromResult(failureResponse));

            // Act
            var result = await _controller.UpdateTreatment(treatmentDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task SoftDeleteTreatment_WhenTreatmentExists_ReturnsOkResponse()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            var treatment = new Treatment
            {
                treatmentId = treatmentId,
                treatmentName = "Obsolete Treatment",
                isDeleted = false
            };

            var successResponse = new Response(true, "Treatment deleted successfully");

            A.CallTo(() => _treatmentService.GetByIdAsync(treatmentId)).Returns(Task.FromResult(treatment));
            A.CallTo(() => _treatmentService.DeleteAsync(treatment)).Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.DeleteTreatment(treatmentId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task HardDeleteTreatment_WhenTreatmentExists_ReturnsOkResponse()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            var treatment = new Treatment
            {
                treatmentId = treatmentId,
                treatmentName = "Obsolete Treatment",
                isDeleted = true
            };

            var successResponse = new Response(true, "Treatment deleted successfully");

            A.CallTo(() => _treatmentService.GetByIdAsync(treatmentId)).Returns(Task.FromResult(treatment));
            A.CallTo(() => _treatmentService.DeleteAsync(treatment)).Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.DeleteTreatment(treatmentId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteTreatment_WhenTreatmentDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            A.CallTo(() => _treatmentService.GetByIdAsync(treatmentId)).Returns(Task.FromResult<Treatment>(null));

            // Act
            var result = await _controller.DeleteTreatment(treatmentId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Contain("not found or already deleted");
        }

        [Fact]
        public async Task DeleteTreatment_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var treatmentId = Guid.NewGuid();
            var treatment = new Treatment
            {
                treatmentId = treatmentId,
                treatmentName = "In-Use Treatment",
                isDeleted = false
            };

            var failureResponse = new Response(false, "Cannot delete treatment because it is in use");

            A.CallTo(() => _treatmentService.GetByIdAsync(treatmentId)).Returns(Task.FromResult(treatment));
            A.CallTo(() => _treatmentService.DeleteAsync(treatment)).Returns(Task.FromResult(failureResponse));

            // Act
            var result = await _controller.DeleteTreatment(treatmentId);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }
        [Fact]
        public async Task GetAvailableTreatments_WhenTreatmentsExist_ReturnsOkResponseWithData()
        {
            // Arrange
            var treatments = new List<Treatment>
            {
                new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Available Treatment 1", isDeleted = false },
                new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Available Treatment 2", isDeleted = false }
            };

            var treatmentDtos = new List<TreatmentDTO>
            {
                new TreatmentDTO { treatmentId = treatments[0].treatmentId, treatmentName = treatments[0].treatmentName, isDeleted = false },
                new TreatmentDTO { treatmentId = treatments[1].treatmentId, treatmentName = treatments[1].treatmentName, isDeleted = false }
            };

            A.CallTo(() => _treatmentService.ListAvailableTreatmentAsync()).Returns(Task.FromResult<IEnumerable<Treatment>>(treatments));

            // Act
            var result = await _controller.GetAvailableTreatments();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Message.Should().Be("Available rooms retrieved successfully");

            var returnedTreatments = response.Data as IEnumerable<TreatmentDTO>;
            returnedTreatments.Should().NotBeNull();
            returnedTreatments!.Count().Should().Be(2);
        }

        [Fact]
        public async Task GetAvailableTreatments_WhenNoTreatmentsExist_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _treatmentService.ListAvailableTreatmentAsync()).Returns(Task.FromResult<IEnumerable<Treatment>>(new List<Treatment>()));

            // Act
            var result = await _controller.GetAvailableTreatments();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("No available rooms found");
        }
    }
}

