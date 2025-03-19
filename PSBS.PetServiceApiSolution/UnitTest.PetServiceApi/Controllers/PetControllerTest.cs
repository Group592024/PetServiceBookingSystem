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
    public class PetControllerTest
    {
        private readonly IPet _petInterface;
        private readonly IPetBreed _petBreedInterface;
        private readonly PetController _controller;

        public PetControllerTest()
        {
            _petInterface = A.Fake<IPet>();
            _petBreedInterface = A.Fake<IPetBreed>();
            _controller = new PetController(_petBreedInterface, _petInterface);
        }

        [Fact]
        public async Task GetPetsList_WhenPetsExist_ReturnsOkResponseWithPets()
        {
            // Arrange
            var pets = new List<Pet>
            {
                new Pet { Pet_ID = Guid.NewGuid(), Pet_Name = "Test Pet 1" },
                new Pet { Pet_ID = Guid.NewGuid(), Pet_Name = "Test Pet 2" }
            };
            A.CallTo(() => _petInterface.GetAllAsync()).Returns(pets);

            // Act
            var result = await _controller.GetPetsList();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPetsList_WhenNoPets_ReturnsNotFound()
        {
            // Arrange
            A.CallTo(() => _petInterface.GetAllAsync()).Returns(new List<Pet>());

            // Act
            var result = await _controller.GetPetsList();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task GetPetById_WhenPetExists_ReturnsOkResponseWithPet()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var pet = new Pet 
            { 
                Pet_ID = petId, 
                Pet_Name = "Test Pet",
                PetBreed = new PetBreed { PetBreed_ID = Guid.NewGuid() }
            };
            A.CallTo(() => _petInterface.GetByIdAsync(petId)).Returns(pet);

            // Act
            var result = await _controller.GetPetById(petId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPetById_WhenPetDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            A.CallTo(() => _petInterface.GetByIdAsync(petId)).Returns((Pet)null);

            // Act
            var result = await _controller.GetPetById(petId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task CreatePet_WhenValidInput_ReturnsOkResponse()
        {
            // Arrange
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "Test Pet",
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid()
            };

            A.CallTo(() => _petBreedInterface.GetByIdAsync(petDto.petBreedId))
                .Returns(new PetBreed { PetBreed_ID = petDto.petBreedId });

            A.CallTo(() => _petInterface.CreateAsync(A<Pet>.Ignored))
                .Returns(new Response(true, "Pet created successfully"));

            // Act
            var result = await _controller.CreatePet(petDto, null);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task CreatePet_WhenModelStateInvalid_ReturnsBadRequest()
        {
            // Arrange
            var petDto = new PetDTO();
            _controller.ModelState.AddModelError("petName", "Required");

            // Act
            var result = await _controller.CreatePet(petDto, null);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task CreatePet_WhenValidInputWithImage_ReturnsOkResponse()
        {
            // Arrange
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "Test Pet",
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid()
            };

            // Setup mock file
            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(1024);
            A.CallTo(() => mockImageFile.FileName).Returns("test.jpg");
            A.CallTo(() => mockImageFile.ContentType).Returns("image/jpeg");
            A.CallTo(() => mockImageFile.OpenReadStream()).Returns(new MemoryStream());
            A.CallTo(() => mockImageFile.CopyToAsync(A<Stream>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.CompletedTask);

            // Setup breed check
            A.CallTo(() => _petBreedInterface.GetByIdAsync(petDto.petBreedId))
                .Returns(new PetBreed { PetBreed_ID = petDto.petBreedId });

            // Setup create pet
            A.CallTo(() => _petInterface.CreateAsync(A<Pet>.That.Matches(p => 
                p.Pet_Name == petDto.petName)))
                .Returns(new Response(true, "Pet created successfully"));

            // Act
            var result = await _controller.CreatePet(petDto, mockImageFile);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();

            // Verify that CreateAsync was called with correct parameters
            A.CallTo(() => _petInterface.CreateAsync(A<Pet>.That.Matches(p => 
                p.Pet_Name == petDto.petName &&
                p.PetBreed_ID == petDto.petBreedId &&
                p.Account_ID == petDto.accountId)))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreatePet_WhenInvalidImage_ReturnsBadRequest()
        {
            // Arrange
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "Test Pet",
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid()
            };

            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(0);
            A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");

            // Act
            var result = await _controller.CreatePet(petDto, mockImageFile);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePet_WhenValidInput_ReturnsOkResponse()
        {
            // Arrange
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "Updated Pet",
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid()
            };

            A.CallTo(() => _petInterface.GetByIdAsync(petDto.petId))
                .Returns(new Pet { Pet_ID = petDto.petId });

            A.CallTo(() => _petInterface.UpdateAsync(A<Pet>.Ignored))
                .Returns(new Response(true, "Pet updated successfully"));

            // Act
            var result = await _controller.UpdatePet(petDto, null);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
        }

        [Fact]
        public async Task UpdatePet_WhenPetNotFound_ReturnsNotFound()
        {
            // Arrange
            var petDto = new PetDTO { petId = Guid.NewGuid() };
            A.CallTo(() => _petInterface.GetByIdAsync(petDto.petId))
                .Returns((Pet)null);

            // Act
            var result = await _controller.UpdatePet(petDto, null);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePet_WhenValidInputWithNewImage_ReturnsOkResponse()
        {
            // Arrange
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "Updated Pet",
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid(),
                petImage = "old_image.jpg"
            };

            var existingPet = new Pet
            {
                Pet_ID = petDto.petId,
                Pet_Name = "Original Pet",
                Pet_Image = "old_image.jpg"
            };

            // Setup mock file
            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(1024);
            A.CallTo(() => mockImageFile.FileName).Returns("new_image.jpg");
            A.CallTo(() => mockImageFile.ContentType).Returns("image/jpeg");
            A.CallTo(() => mockImageFile.OpenReadStream()).Returns(new MemoryStream());
            A.CallTo(() => mockImageFile.CopyToAsync(A<Stream>.Ignored, A<CancellationToken>.Ignored))
                .Returns(Task.CompletedTask);

            // Setup pet retrieval
            A.CallTo(() => _petInterface.GetByIdAsync(petDto.petId))
                .Returns(existingPet);

            // Setup update
            A.CallTo(() => _petInterface.UpdateAsync(A<Pet>.Ignored))
                .Returns(new Response(true, "Pet updated successfully"));

            // Act
            var result = await _controller.UpdatePet(petDto, mockImageFile);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();

            // Verify that UpdateAsync was called with correct parameters
            A.CallTo(() => _petInterface.UpdateAsync(A<Pet>.That.Matches(p => 
                p.Pet_Name == petDto.petName &&
                p.PetBreed_ID == petDto.petBreedId &&
                p.Account_ID == petDto.accountId &&
                p.Pet_ID == petDto.petId)))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdatePet_WhenInvalidImage_ReturnsBadRequest()
        {
            // Arrange
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "Updated Pet",
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid()
            };

            var existingPet = new Pet
            {
                Pet_ID = petDto.petId,
                Pet_Name = "Original Pet",
                Pet_Image = "old_image.jpg"
            };

            // Setup mock file with invalid properties
            var mockImageFile = A.Fake<IFormFile>();
            A.CallTo(() => mockImageFile.Length).Returns(0);
            A.CallTo(() => mockImageFile.FileName).Returns("invalid.txt");
            A.CallTo(() => mockImageFile.ContentType).Returns("text/plain");

            // Setup pet retrieval
            A.CallTo(() => _petInterface.GetByIdAsync(petDto.petId))
                .Returns(existingPet);

            // Act
            var result = await _controller.UpdatePet(petDto, mockImageFile);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdatePet_WhenNoImageProvided_UsesExistingImage()
        {
            // Arrange
            var existingImagePath = "existing_image.jpg";
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "Updated Pet",
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid(),
                petImage = existingImagePath
            };

            var existingPet = new Pet
            {
                Pet_ID = petDto.petId,
                Pet_Name = "Original Pet",
                Pet_Image = existingImagePath,
                PetBreed_ID = petDto.petBreedId,
                Account_ID = petDto.accountId
            };

            // Setup pet retrieval
            A.CallTo(() => _petInterface.GetByIdAsync(petDto.petId))
                .Returns(existingPet);

            // Setup update
            A.CallTo(() => _petInterface.UpdateAsync(A<Pet>.Ignored))
                .Returns(new Response(true, "Pet updated successfully"));

            // Act
            var result = await _controller.UpdatePet(petDto, null);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();

            // Verify that UpdateAsync was called with correct parameters including existing image
            A.CallTo(() => _petInterface.UpdateAsync(A<Pet>.That.Matches(p => 
                p.Pet_Name == petDto.petName &&
                p.PetBreed_ID == petDto.petBreedId &&
                p.Account_ID == petDto.accountId &&
                p.Pet_ID == petDto.petId &&
                p.Pet_Image == existingImagePath)))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task UpdatePet_WhenInvalidInput_ReturnsBadRequest()
        {
            // Arrange
            var petDto = new PetDTO
            {
                petId = Guid.NewGuid(),
                petName = "", // Invalid: empty name
                petBreedId = Guid.NewGuid(),
                accountId = Guid.NewGuid()
            };

            var existingPet = new Pet
            {
                Pet_ID = petDto.petId,
                Pet_Name = "Original Pet"
            };

            A.CallTo(() => _petInterface.GetByIdAsync(petDto.petId))
                .Returns(existingPet);

            // Act
            var result = await _controller.UpdatePet(petDto, null);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

            var response = badRequestResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task DeletePet_WhenPetNotFound_ReturnsNotFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            A.CallTo(() => _petInterface.GetByIdAsync(petId))
                .Returns((Pet)null);

            // Act
            var result = await _controller.DeletePet(petId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task DeletePet_WhenSoftDelete_ReturnsOkResponse()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var pet = new Pet 
            { 
                Pet_ID = petId, 
                Pet_Name = "Test Pet",
                IsDelete = false
            };
            
            A.CallTo(() => _petInterface.GetByIdAsync(petId))
                .Returns(pet);
            
            A.CallTo(() => _petInterface.DeleteAsync(A<Pet>.Ignored))
                .Returns(new Response(true, "Pet has been soft deleted successfully"));

            // Act
            var result = await _controller.DeletePet(petId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Contain("soft deleted");
        }

        [Fact]
        public async Task DeletePet_WhenHardDelete_ReturnsOkResponse()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var pet = new Pet 
            { 
                Pet_ID = petId, 
                Pet_Name = "Test Pet",
                IsDelete = true
            };
            
            A.CallTo(() => _petInterface.GetByIdAsync(petId))
                .Returns(pet);
            
            A.CallTo(() => _petInterface.DeleteAsync(A<Pet>.Ignored))
                .Returns(new Response(true, "Pet has been permanently deleted"));

            // Act
            var result = await _controller.DeletePet(petId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Contain("permanently deleted");
        }

        [Fact]
        public async Task DeletePet_WhenServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var pet = new Pet 
            { 
                Pet_ID = petId, 
                Pet_Name = "Test Pet",
                IsDelete = false
            };
            
            A.CallTo(() => _petInterface.GetByIdAsync(petId))
                .Returns(pet);
            
            A.CallTo(() => _petInterface.DeleteAsync(A<Pet>.Ignored))
                .Returns(new Response(false, "Failed to delete pet"));

            // Act
            var result = await _controller.DeletePet(petId);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            var response = badRequestResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("Failed to delete pet");
        }
        [Fact]
        public async Task GetAvailablePets_WhenPetsExist_ReturnsOkResponseWithPets()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var pets = new List<Pet>
            {
                new Pet { Pet_ID = Guid.NewGuid(), Pet_Name = "Available Pet 1", IsDelete = false },
                new Pet { Pet_ID = Guid.NewGuid(), Pet_Name = "Available Pet 2", IsDelete = false }
            };

            A.CallTo(() => _petInterface.ListAvailablePetAsync(accountId))
                .Returns(pets);

            // Act
            var result = await _controller.GetAvailablePets(accountId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetAvailablePets_WhenNoPets_ReturnsNotFound()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            A.CallTo(() => _petInterface.ListAvailablePetAsync(accountId))
                .Returns(new List<Pet>());

            // Act
            var result = await _controller.GetAvailablePets(accountId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
            var response = notFoundResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeFalse();
        }
    }
}
