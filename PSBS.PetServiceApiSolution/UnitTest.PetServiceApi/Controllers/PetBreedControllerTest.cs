using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FakeItEasy;
using FluentAssertions;
using PetApi.Application.DTOs;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.PetServiceApi.Controllers
{
    public class PetBreedControllerTest
    {
        private readonly IPetBreed _petBreedInterface;
        private readonly IPetType _petTypeInterface;
        private readonly PetBreedController _controller;

        public PetBreedControllerTest()
        {
            _petBreedInterface = A.Fake<IPetBreed>();
            _petTypeInterface = A.Fake<IPetType>();
            _controller = new PetBreedController(_petBreedInterface, _petTypeInterface);
        }

        [Fact]
        public async Task GetPetBreedsList_WhenPetsExist_ReturnsOkResponseWithBreeds()
        {
            // Arrange
            var petBreeds = new List<PetBreed>
            {
                new PetBreed { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Test Breed 1" },
                new PetBreed { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Test Breed 2" }
            };
            A.CallTo(() => _petBreedInterface.GetAllAsync()).Returns(petBreeds);

            // Act
            var result = await _controller.GetPetBreedsList();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPetBreedsList_WhenNoBreeds_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _petBreedInterface.GetAllAsync()).Returns(new List<PetBreed>());

            // Act
            var result = await _controller.GetPetBreedsList();

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task GetPetBreedById_WhenBreedExists_ReturnsOkResponse()
        {
            // Arrange
            var breedId = Guid.NewGuid();
            var petBreed = new PetBreed { PetBreed_ID = breedId, PetBreed_Name = "Test Breed" };
            A.CallTo(() => _petBreedInterface.GetByIdAsync(breedId)).Returns(petBreed);

            // Act
            var result = await _controller.GetPetBreedById(breedId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPetBreedById_WhenBreedDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var breedId = Guid.NewGuid();
            A.CallTo(() => _petBreedInterface.GetByIdAsync(breedId)).Returns((PetBreed)null);

            // Act
            var result = await _controller.GetPetBreedById(breedId);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task CreatePetBreed_WhenValidInput_ReturnsOkResponse()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "New Breed",
                petBreedDescription = "Description",
                petBreedImage = "image.jpg",
                isDelete = false
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petBreedDto.petTypeId))
                .Returns(new PetType { PetType_ID = petBreedDto.petTypeId });

            A.CallTo(() => _petBreedInterface.CreateAsync(A<PetBreed>.Ignored))
                .Returns(new Response(true, "Pet breed created successfully"));

            // Act
            var result = await _controller.CreatePetBreed(petBreedDto, null);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task CreatePetBreed_WhenValidInputWithImage_ReturnsOkResponse()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "New Breed",
                petBreedDescription = "Description",
                petBreedImage = "image.jpg",
                isDelete = false
            };

            // Setup mock file
            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(1024);
            A.CallTo(() => mockImageFile.FileName).Returns("test.jpg");
            A.CallTo(() => mockImageFile.ContentType).Returns("image/jpeg");
            A.CallTo(() => mockImageFile.OpenReadStream()).Returns(new MemoryStream());
            A.CallTo(() => mockImageFile.CopyToAsync(A<Stream>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.CompletedTask);

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petBreedDto.petTypeId))
                .Returns(new PetType { PetType_ID = petBreedDto.petTypeId });

            A.CallTo(() => _petBreedInterface.CreateAsync(A<PetBreed>.That.Matches(p => 
                p.PetBreed_Name == petBreedDto.petBreedName)))
                .Returns(new Response(true, "Pet breed created successfully"));

            // Act
            var result = await _controller.CreatePetBreed(petBreedDto, mockImageFile);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();

            // Verify CreateAsync was called with correct parameters
            A.CallTo(() => _petBreedInterface.CreateAsync(A<PetBreed>.That.Matches(p => 
                p.PetBreed_Name == petBreedDto.petBreedName &&
                p.PetType_ID == petBreedDto.petTypeId)))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreatePetBreed_WhenInvalidImage_ReturnsBadRequest()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "New Breed"
            };

            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(0);
            A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");

            // Act
            var result = await _controller.CreatePetBreed(petBreedDto, mockImageFile);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);      
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task CreatePetBreed_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "New Breed",
                petBreedDescription = "Description",
                petBreedImage = "image.jpg",
                isDelete = false
            };

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petBreedDto.petTypeId))
                .Returns(new PetType { PetType_ID = petBreedDto.petTypeId });

            A.CallTo(() => _petBreedInterface.CreateAsync(A<PetBreed>.Ignored))
                .Returns(new Response(false, "Failed to create pet breed"));

            // Act
            var result = await _controller.CreatePetBreed(petBreedDto, null);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Failed to create pet breed");
        }

        [Fact]
        public async Task CreatePetBreed_WhenInvalidInput_ReturnsBadRequest()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "", // Invalid: empty name
                petBreedDescription = "Description",
                petBreedImage = "image.jpg",
                isDelete = false
            };

            // Act
            var result = await _controller.CreatePetBreed(petBreedDto, null);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePetBreed_WhenValidInputWithNewImage_ReturnsOkResponse()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "Updated Breed",
                petBreedDescription = "Updated Description",
                petBreedImage = "old-image.jpg",
                isDelete = false
            };

            // Setup mock file
            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(1024);
            A.CallTo(() => mockImageFile.FileName).Returns("new-image.jpg");
            A.CallTo(() => mockImageFile.ContentType).Returns("image/jpeg");
            A.CallTo(() => mockImageFile.OpenReadStream()).Returns(new MemoryStream());
            A.CallTo(() => mockImageFile.CopyToAsync(A<Stream>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.CompletedTask);

            var existingBreed = new PetBreed
            {
                PetBreed_ID = petBreedDto.petBreedId,
                PetBreed_Image = "old-image.jpg"
            };

            A.CallTo(() => _petBreedInterface.GetByIdAsync(petBreedDto.petBreedId))
                .Returns(existingBreed);

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petBreedDto.petTypeId))
                .Returns(new PetType { PetType_ID = petBreedDto.petTypeId });

            A.CallTo(() => _petBreedInterface.UpdateAsync(A<PetBreed>.Ignored))
                .Returns(new Response(true, "Pet breed updated successfully"));

            // Act
            var result = await _controller.UpdatePetBreed(petBreedDto, mockImageFile);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();

            // Verify UpdateAsync was called with correct parameters
            A.CallTo(() => _petBreedInterface.UpdateAsync(A<PetBreed>.That.Matches(p => 
                p.PetBreed_Name == petBreedDto.petBreedName &&
                p.PetType_ID == petBreedDto.petTypeId &&
                p.PetBreed_ID == petBreedDto.petBreedId)))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdatePetBreed_WhenNoImageProvided_UsesExistingImage()
        {
            // Arrange
            var existingImagePath = "existing-image.jpg";
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "Updated Breed",
                petBreedDescription = "Updated Description",
                petBreedImage = existingImagePath,
                isDelete = false
            };

            var existingBreed = new PetBreed
            {
                PetBreed_ID = petBreedDto.petBreedId,
                PetBreed_Name = "Original Breed",
                PetBreed_Image = existingImagePath,
                PetType_ID = petBreedDto.petTypeId
            };

            A.CallTo(() => _petBreedInterface.GetByIdAsync(petBreedDto.petBreedId))
                .Returns(existingBreed);

            A.CallTo(() => _petBreedInterface.UpdateAsync(A<PetBreed>.Ignored))
                .Returns(new Response(true, "Pet breed updated successfully"));

            // Act
            var result = await _controller.UpdatePetBreed(petBreedDto, null);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();

            // Verify UpdateAsync was called with existing image
            A.CallTo(() => _petBreedInterface.UpdateAsync(A<PetBreed>.That.Matches(p => 
                p.PetBreed_Name == petBreedDto.petBreedName &&
                p.PetBreed_Image == existingImagePath)))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdatePetBreed_WhenInvalidImage_ReturnsBadRequest()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "Updated Breed"
            };

            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(0);
            A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");
            A.CallTo(() => mockImageFile.ContentType).Returns("text/plain");

            var existingBreed = new PetBreed
            {
                PetBreed_ID = petBreedDto.petBreedId,
                PetBreed_Image = "old-image.jpg"
            };

            A.CallTo(() => _petBreedInterface.GetByIdAsync(petBreedDto.petBreedId))
                .Returns(existingBreed);

            // Act
            var result = await _controller.UpdatePetBreed(petBreedDto, mockImageFile);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePetBreed_WhenInvalidInput_ReturnsBadRequest()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "", // Invalid: empty name
                petBreedDescription = "Description",
                petBreedImage = "image.jpg",
                isDelete = false
            };

            var existingBreed = new PetBreed
            {
                PetBreed_ID = petBreedDto.petBreedId,
                PetBreed_Name = "Original Name",
                PetBreed_Image = "old-image.jpg"
            };

            A.CallTo(() => _petBreedInterface.GetByIdAsync(petBreedDto.petBreedId))
                .Returns(existingBreed);

            // Act
            var result = await _controller.UpdatePetBreed(petBreedDto, null);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePetBreed_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var petBreedDto = new PetBreedDTO
            {
                petBreedId = Guid.NewGuid(),
                petTypeId = Guid.NewGuid(),
                petBreedName = "Updated Breed",
                petBreedDescription = "Updated Description",
                petBreedImage = "old-image.jpg",
                isDelete = false
            };

            var existingBreed = new PetBreed
            {
                PetBreed_ID = petBreedDto.petBreedId,
                PetBreed_Image = "old-image.jpg"
            };

            A.CallTo(() => _petBreedInterface.GetByIdAsync(petBreedDto.petBreedId))
                .Returns(existingBreed);

            A.CallTo(() => _petTypeInterface.GetByIdAsync(petBreedDto.petTypeId))
                .Returns(new PetType { PetType_ID = petBreedDto.petTypeId });

            A.CallTo(() => _petBreedInterface.UpdateAsync(A<PetBreed>.Ignored))
                .Returns(new Response(false, "Failed to update pet breed"));

            // Act
            var result = await _controller.UpdatePetBreed(petBreedDto, null);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Failed to update pet breed");
        }

        [Fact]
        public async Task DeletePetBreed_WhenBreedExists_ReturnsOkResponse()
        {
            // Arrange
            var breedId = Guid.NewGuid();
            var petBreed = new PetBreed { PetBreed_ID = breedId, PetBreed_Name = "Test Breed" };
            
            A.CallTo(() => _petBreedInterface.GetByIdAsync(breedId))
                .Returns(petBreed);
            
            A.CallTo(() => _petBreedInterface.DeleteAsync(A<PetBreed>.That.Matches(p => p.PetBreed_ID == breedId)))
                .Returns(new Response(true, "Pet breed deleted successfully"));

            // Act
            var result = await _controller.DeletePetBreed(breedId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task DeletePetBreed_WhenSoftDelete_ReturnsOkResponse()
        {
            // Arrange
            var breedId = Guid.NewGuid();
            var petBreed = new PetBreed 
            { 
                PetBreed_ID = breedId, 
                PetBreed_Name = "Test Breed",
                IsDelete = false
            };
            
            A.CallTo(() => _petBreedInterface.GetByIdAsync(breedId))
                .Returns(petBreed);
            
            A.CallTo(() => _petBreedInterface.DeleteAsync(A<PetBreed>.Ignored))
                .Returns(new Response(true, "Pet breed has been soft deleted successfully"));

            // Act
            var result = await _controller.DeletePetBreed(breedId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Contain("soft deleted");
        }

        [Fact]
        public async Task DeletePetBreed_WhenHardDelete_ReturnsOkResponse()
        {
            // Arrange
            var breedId = Guid.NewGuid();
            var petBreed = new PetBreed 
            { 
                PetBreed_ID = breedId, 
                PetBreed_Name = "Test Breed",
                IsDelete = true
            };
            
            A.CallTo(() => _petBreedInterface.GetByIdAsync(breedId))
                .Returns(petBreed);
            
            A.CallTo(() => _petBreedInterface.DeleteAsync(A<PetBreed>.Ignored))
                .Returns(new Response(true, "Pet breed has been permanently deleted"));

            // Act
            var result = await _controller.DeletePetBreed(breedId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Contain("permanently deleted");
        }

        [Fact]
        public async Task DeletePetBreed_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var breedId = Guid.NewGuid();
            var petBreed = new PetBreed 
            { 
                PetBreed_ID = breedId, 
                PetBreed_Name = "Test Breed",
                IsDelete = false
            };
            
            A.CallTo(() => _petBreedInterface.GetByIdAsync(breedId))
                .Returns(petBreed);
            
            A.CallTo(() => _petBreedInterface.DeleteAsync(A<PetBreed>.Ignored))
                .Returns(new Response(false, "Failed to delete pet breed"));

            // Act
            var result = await _controller.DeletePetBreed(breedId);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
            response.Message.Should().Be("Failed to delete pet breed");
        }

        [Fact]
        public async Task GetBreedsByPetTypeId_WhenBreedsExist_ReturnsOkResponse()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();
            var petBreeds = new List<PetBreed>
            {
                new PetBreed { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Test Breed 1", PetType_ID = petTypeId },
                new PetBreed { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Test Breed 2", PetType_ID = petTypeId }
            };
            
            A.CallTo(() => _petBreedInterface.GetBreedsByPetTypeIdAsync(petTypeId))
                .Returns(petBreeds);

            // Act
            var result = await _controller.GetBreedsByPetTypeId(petTypeId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetBreedsByPetTypeId_WhenBreedsDoNotExist_ReturnsNotFound()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();
            A.CallTo(() => _petBreedInterface.GetBreedsByPetTypeIdAsync(petTypeId))
                .Returns(new List<PetBreed>());

            // Act
            var result = await _controller.GetBreedsByPetTypeId(petTypeId);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task GetAvailablePetBreeds_WhenBreedsExist_ReturnsOkResponse()
        {
            // Arrange
            var availableBreeds = new List<PetBreed>
            {
                new PetBreed { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Available Breed 1", IsDelete = false },
                new PetBreed { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Available Breed 2", IsDelete = false }
            };
            
            A.CallTo(() => _petBreedInterface.ListAvailablePetBreedAsync())
                .Returns(availableBreeds);

            // Act
            var result = await _controller.GetAvailablePetBreeds();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetAvailablePetBreeds_WhenNoBreeds_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _petBreedInterface.ListAvailablePetBreedAsync())
                .Returns(new List<PetBreed>());

            // Act
            var result = await _controller.GetAvailablePetBreeds();

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Contain("No available pet breeds");
        }

        [Fact]
        public async Task DeletePetBreed_WhenBreedNotFound_ReturnsNotFound()
        {
            // Arrange
            var breedId = Guid.NewGuid();
            A.CallTo(() => _petBreedInterface.GetByIdAsync(breedId))
                .Returns((PetBreed)null);

            // Act
            var result = await _controller.DeletePetBreed(breedId);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
        }
    }
}
