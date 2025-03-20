using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PetApi.Application.DTOs;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.PetServiceApi.Controllers
{
    public class PetTypeControllerTest
    {
        private readonly IPetType _petTypeInterface;
        private readonly IPetBreed _petBreedInterface;
        private readonly PetTypeController _controller;

        public PetTypeControllerTest()
        {
            _petTypeInterface = A.Fake<IPetType>();
            _petBreedInterface = A.Fake<IPetBreed>();
            _controller = new PetTypeController(_petTypeInterface, _petBreedInterface);
        }

        [Fact]
        public async Task GetPetTypes_WhenTypesExist_ReturnsOkResponseWithTypes()
        {
            // Arrange
            var petTypes = new List<PetType>
            {
                new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Test Type 1" },
                new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Test Type 2" }
            };
            A.CallTo(() => _petTypeInterface.GetAllAsync()).Returns(petTypes);

            // Act
            var result = await _controller.GetPetTypes();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPetTypes_WhenNoTypes_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _petTypeInterface.GetAllAsync()).Returns(new List<PetType>());

            // Act
            var result = await _controller.GetPetTypes();

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task GetPetTypeById_WhenTypeExists_ReturnsOkResponse()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            var petType = new PetType { PetType_ID = typeId, PetType_Name = "Test Type" };
            A.CallTo(() => _petTypeInterface.GetByIdAsync(typeId)).Returns(petType);

            // Act
            var result = await _controller.GetPetType(typeId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPetTypeById_WhenTypeDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            A.CallTo(() => _petTypeInterface.GetByIdAsync(typeId)).Returns((PetType)null);

            // Act
            var result = await _controller.GetPetType(typeId);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }


        [Fact]
        public async Task CreatePetType_WhenAllValidInput_ReturnsOkResponse()
        {
            // Arrange
            var petTypeDto = new CreatePetTypeDTO("New Type", "Description");

            var fileMock = new Mock<IFormFile>();
            var content = new byte[100];
            var stream = new MemoryStream(content);
            var fileName = "test.jpg";

            fileMock.Setup(_ => _.OpenReadStream()).Returns(stream);
            fileMock.Setup(_ => _.FileName).Returns(fileName);
            fileMock.Setup(_ => _.Length).Returns(content.Length);
            fileMock.Setup(_ => _.ContentType).Returns("image/jpeg");

            A.CallTo(() => _petTypeInterface.CreateAsync(A<PetType>.Ignored))
                .Returns(new Response(true, "Pet type created successfully"));

            // Act
            var result = await _controller.CreatePetType(petTypeDto, fileMock.Object);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
        }


        [Fact]
        public async Task CreatePetType_WhenInvalidImage_ReturnsBadRequest()
        {
            // Arrange
            var petTypeDto = new CreatePetTypeDTO
            ("New Type", "Description");

            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(0);
            A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");

            // Act
            var result = await _controller.CreatePetType(petTypeDto, mockImageFile);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("The uploaded file failed");
        }

        [Fact]
        public async Task CreatePetType_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var petTypeDto = new CreatePetTypeDTO
            ("New Type", "Description");

            var fileMock = new Mock<IFormFile>();
            var content = new byte[100];
            var stream = new MemoryStream(content);
            var fileName = "test.jpg";

            fileMock.Setup(_ => _.OpenReadStream()).Returns(stream);
            fileMock.Setup(_ => _.FileName).Returns(fileName);
            fileMock.Setup(_ => _.Length).Returns(content.Length);
            fileMock.Setup(_ => _.ContentType).Returns("image/jpeg");

            A.CallTo(() => _petTypeInterface.CreateAsync(A<PetType>.Ignored))
                .Returns(new Response(false, "Failed to create pet type"));

            // Act
            var result = await _controller.CreatePetType(petTypeDto, fileMock.Object);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Failed to create pet type");
        }

        [Fact]
        public async Task CreatePetType_WhenInvalidName_ReturnsBadRequest()
        {
            // Arrange
            var petTypeDto = new CreatePetTypeDTO
            ("", "Description"); // Invalid: empty name
            var fileMock = new Mock<IFormFile>();
            var content = new byte[100];
            var stream = new MemoryStream(content);
            var fileName = "test.jpg";

            fileMock.Setup(_ => _.OpenReadStream()).Returns(stream);
            fileMock.Setup(_ => _.FileName).Returns(fileName);
            fileMock.Setup(_ => _.Length).Returns(content.Length);
            fileMock.Setup(_ => _.ContentType).Returns("image/jpeg");

            // Act
            var result = await _controller.CreatePetType(petTypeDto, fileMock.Object);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePetType_WhenAllValidInput_ReturnsOkResponse()
        {
            // Arrange

            var petTypeId = Guid.NewGuid();
            var petTypeDto = new UpdatePetTypeDTO
            ("Updated Type", "Update Description", false);

            // Setup mock file
            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(1024);
            A.CallTo(() => mockImageFile.FileName).Returns("new-image.jpg");
            A.CallTo(() => mockImageFile.ContentType).Returns("image/jpeg");
            A.CallTo(() => mockImageFile.OpenReadStream()).Returns(new MemoryStream());
            A.CallTo(() => mockImageFile.CopyToAsync(A<Stream>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.CompletedTask);

            var existingType = new PetType
            {
                PetType_ID = petTypeId,
                PetType_Name = "Old Type",
                PetType_Description = "Old Description",
                PetType_Image = "/images/old-image.jpg",
                IsDelete = true
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petTypeId))
        .Returns(Task.FromResult(existingType));

            A.CallTo(() => _petTypeInterface.UpdateAsync(A<PetType>.Ignored))
                .Returns(Task.FromResult(new Response(true, "Pet type updated successfully")));

            // Act
            var result = await _controller.UpdatePetType(petTypeId, petTypeDto, mockImageFile);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();

            // Verify UpdateAsync was called with correct parameters
            A.CallTo(() => _petTypeInterface.UpdateAsync(A<PetType>.That.Matches(p =>
        p.PetType_ID == petTypeId &&
        p.PetType_Name == petTypeDto.PetType_Name &&
        p.PetType_Description == petTypeDto.PetType_Description &&
        p.IsDelete == petTypeDto.IsDelete &&
        !string.IsNullOrEmpty(p.PetType_Image)
    ))).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdatePetType_WhenNoImageProvided_UsesExistingImage()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();
            var petTypeDto = new UpdatePetTypeDTO
             ("Updated Type", "Update Description", false);

            var existingType = new PetType
            {
                PetType_ID = petTypeId,
                PetType_Name = "Old Type",
                PetType_Description = "Old Description",
                PetType_Image = "/images/old-image.jpg",
                IsDelete = true
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petTypeId))
        .Returns(Task.FromResult(existingType));

            A.CallTo(() => _petTypeInterface.UpdateAsync(A<PetType>.Ignored))
                .Returns(Task.FromResult(new Response(true, "Pet type updated successfully")));

            // Act
            var result = await _controller.UpdatePetType(petTypeId, petTypeDto, null);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();

            // Verify UpdateAsync was called with correct parameters
            A.CallTo(() => _petTypeInterface.UpdateAsync(A<PetType>.That.Matches(p =>
        p.PetType_ID == petTypeId &&
        p.PetType_Name == petTypeDto.PetType_Name &&
        p.PetType_Description == petTypeDto.PetType_Description &&
        p.IsDelete == petTypeDto.IsDelete &&
        !string.IsNullOrEmpty(p.PetType_Image)
    ))).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdatePetType_WhenInvalidImage_ReturnsBadRequest()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();
            var petTypeDto = new UpdatePetTypeDTO("Updated Type", "Updated Description", false);

            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(1024);
            A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");
            A.CallTo(() => mockImageFile.ContentType).Returns("text/plain");

            var existingType = new PetType
            {
                PetType_ID = petTypeId,
                PetType_Image = "/images/old-image.jpg"
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petTypeId))
                .Returns(Task.FromResult(existingType));

            // Act
            var result = await _controller.UpdatePetType(petTypeId, petTypeDto, mockImageFile);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePetType_WhenInvalidInput_ReturnsBadRequest()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();

            // Invalid: type name empty
            var petTypeDto = new UpdatePetTypeDTO("", "Description", false);

            var existingType = new PetType
            {
                PetType_ID = petTypeId,
                PetType_Name = "Original Name",
                PetType_Description = "Original Description",
                PetType_Image = "/images/old-image.jpg"
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petTypeId))
                .Returns(Task.FromResult(existingType));

            // Act
            var result = await _controller.UpdatePetType(petTypeId, petTypeDto, null);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePetType_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();
            var petTypeDto = new UpdatePetTypeDTO("Updated Type", "Updated Description", false);

            var existingType = new PetType
            {
                PetType_ID = petTypeId,
                PetType_Name = "Old Type",
                PetType_Description = "Old Description",
                PetType_Image = "/images/old-image.jpg",
                IsDelete = false
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petTypeId))
                .Returns(Task.FromResult(existingType));

            A.CallTo(() => _petTypeInterface.UpdateAsync(A<PetType>.Ignored))
                .Returns(Task.FromResult(new Response(false, "Failed to update pet type")));

            // Act
            var result = await _controller.UpdatePetType(petTypeId, petTypeDto, null);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("Failed to update pet type");
        }

        [Fact]
        public async Task DeletePetType_WhenPetTypeNotFound_ReturnsNotFound()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            A.CallTo(() => _petTypeInterface.GetByIdAsync(typeId)).Returns(Task.FromResult<PetType?>(null));

            // Act
            var result = await _controller.DeletePetType(typeId);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }


        [Fact]
        public async Task DeletePetType_WhenSoftDelete_ReturnsOkResponse()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            var petType = new PetType
            {
                PetType_ID = typeId,
                PetType_Name = "Test Type",
                IsDelete = false
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(typeId)).Returns(petType);
            A.CallTo(() => _petTypeInterface.DeleteAsync(petType))
                .Returns(new Response(true, $"{petType.PetType_Name} is marked as soft deleted  successfully"));

            // Act
            var result = await _controller.DeletePetType(typeId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Contain($"{petType.PetType_Name} is marked as soft deleted  successfully");
        }

        [Fact]
        public async Task DeletePetType_WhenHardDeleteWithoutPetBreed_ReturnsOkResponse()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            var petType = new PetType
            {
                PetType_ID = typeId,
                PetType_Name = "Test Type",
                IsDelete = true
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(typeId)).Returns(petType);
            A.CallTo(() => _petBreedInterface.CheckIfPetTypeHasPetBreed(typeId)).Returns(false);
            A.CallTo(() => _petTypeInterface.DeleteSecondAsync(petType))
                .Returns(new Response(true, "Pet type permanently deleted"));

            // Act
            var result = await _controller.DeletePetType(typeId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Contain("Pet type permanently deleted");
        }

        [Fact]
        public async Task DeletePetType_WhenHardDeleteWithPetBreed_ReturnsConflict()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            var petType = new PetType
            {
                PetType_ID = typeId,
                PetType_Name = "Test Type",
                IsDelete = true
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(typeId)).Returns(petType);
            A.CallTo(() => _petBreedInterface.CheckIfPetTypeHasPetBreed(typeId)).Returns(true);

            // Act
            var result = await _controller.DeletePetType(typeId);

            // Assert
            var conflictResult = result.Result.Should().BeOfType<ConflictObjectResult>().Subject;
            conflictResult.StatusCode.Should().Be(StatusCodes.Status409Conflict);
            var response = conflictResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Contain("Can't delete this pet type because it has pet breed");
        }

        [Fact]
        public async Task DeletePetType_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var typeId = Guid.NewGuid();
            var petType = new PetType
            {
                PetType_ID = typeId,
                PetType_Name = "Test Type",
                IsDelete = false
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(typeId)).Returns(petType);
            A.CallTo(() => _petTypeInterface.DeleteAsync(petType))
                .Returns(new Response(false, "Failed to delete pet type"));

            // Act
            var result = await _controller.DeletePetType(typeId);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("Failed to delete pet type");
        }

        [Fact]
        public async Task GetAvailablePetTypes_WhenPetTypeExists_ReturnsOkResponse()
        {
            // Arrange
            var petTypes = new List<PetType>
        {
            new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Dog", PetType_Image="dog.png",
                PetType_Description="Description", IsDelete=false },
            new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Cat", PetType_Image="cat.png",
                PetType_Description="Description", IsDelete=false  }
        };

            A.CallTo(() => _petTypeInterface.ListAvailablePetTypeAsync()).Returns(petTypes);


            // Act
            var result = await _controller.GetAvailablePetTypes();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Available pet types retrieved successfully");
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetAvailablePetTypes_WhenNoPetType_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _petTypeInterface.ListAvailablePetTypeAsync()).Returns(new List<PetType>());

            // Act
            var result = await _controller.GetAvailablePetTypes();

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);

            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("No pet types found");
        }

        [Fact]
        public async Task GetAvailablePetTypes_WhenServiceFails_ReturnsInternalServerError()
        {
            // Arrange
            A.CallTo(() => _petTypeInterface.ListAvailablePetTypeAsync())
                .Throws(new Exception("Error occurred retrieving non-deleted pet type"));

            // Act
            var result = await Assert.ThrowsAsync<Exception>(() => _controller.GetAvailablePetTypes());

            // Assert
            result.Message.Should().Be("Error occurred retrieving non-deleted pet type");
        }
    }
}
