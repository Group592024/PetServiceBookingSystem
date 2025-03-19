using FakeItEasy;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PetApi.Infrastructure.Repositories;
using System.Net;
using System.Text;
using System.Text.Json;

namespace UnitTest.PetServiceApi.Repositories
{
    public class PetRepositoryTest
    {
        private readonly PetDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly PetRepository _repository;
        private readonly HttpClient _httpClient;
        private readonly HttpMessageHandler _fakeHttpMessageHandler;

        public PetRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<PetDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) 
                .Options;
            _context = new PetDbContext(options);
            _fakeHttpMessageHandler = A.Fake<HttpMessageHandler>();
            _httpClient = new HttpClient(_fakeHttpMessageHandler) { BaseAddress = new Uri("http://localhost/") };
            _httpClientFactory = A.Fake<IHttpClientFactory>();
            A.CallTo(() => _httpClientFactory.CreateClient("ApiGateway")).Returns(_httpClient);
            _repository = new PetRepository(_httpClientFactory, _context);
        }
        private void SetupHttpClientResponse(bool hasBookings, bool isSuccessful = true)
        {
            string jsonContent = JsonSerializer.Serialize(hasBookings);
            var responseMessage = new HttpResponseMessage
            {
                StatusCode = isSuccessful ? HttpStatusCode.OK : HttpStatusCode.InternalServerError,
                Content = new StringContent(jsonContent, Encoding.UTF8, "application/json")
            };
            A.CallTo(_fakeHttpMessageHandler)
                .WithReturnType<Task<HttpResponseMessage>>()
                .Where(call => call.Method.Name == "SendAsync")
                .Returns(Task.FromResult(responseMessage));
        }

        [Fact]
        public async Task CreateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Test Pet",
                Pet_Gender = false,
                Pet_Note = "Test note",
                Pet_Image = "test.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };

            // Act
            var result = await _repository.CreateAsync(pet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{pet.Pet_Name} added successfully");
            
            // Verify pet was added to database
            var savedPet = await _context.Pets.FindAsync(pet.Pet_ID);
            savedPet.Should().NotBeNull();
            savedPet.Pet_Name.Should().Be("Test Pet");
            savedPet.IsDelete.Should().BeFalse();
        }

        [Fact]
        public async Task CreateAsync_WhenInvalidInput_ReturnsErrorResponse()
        {
            // Arrange
            var invalidPet = new Pet
            {
                Pet_ID = Guid.Empty, // Invalid ID
                Pet_Name = null, // Invalid name
                Pet_Gender = false,
                Pet_Note = "",
                Pet_Image = "",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "",
                Pet_FurType = "",
                Pet_FurColor = "",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };

            // Act
            var result = await _repository.CreateAsync(invalidPet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task CreateAsync_WhenPetNameAlreadyExists_ReturnErrorResponse()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var existingPet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Existing Pet",
                Pet_Gender = false,
                Pet_Note = "Existing note",
                Pet_Image = "existing.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-3),
                Pet_Weight = "4kg",
                Pet_FurType = "Long",
                Pet_FurColor = "White",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = accountId
            };
            
            _context.Pets.Add(existingPet);
            await _context.SaveChangesAsync();
            
            var newPet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Existing Pet", // Same name
                Pet_Gender = true,
                Pet_Note = "New note",
                Pet_Image = "new.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-1),
                Pet_Weight = "3kg",
                Pet_FurType = "Medium",
                Pet_FurColor = "Black",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = accountId     // Same account
            };
            
            // Act
            var result = await _repository.CreateAsync(newPet);
            
            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Pet with Name {newPet.Pet_Name} already exists in this account!");
        }

        [Fact]
        public async Task GetByIdAsync_WhenPetExists_ReturnPet()
        {
            // Arrange
            var petBreed = new PetBreed
            {
                PetBreed_ID = Guid.NewGuid(),
                PetBreed_Name = "Golden Retriever",
                PetBreed_Description = "Friendly and intelligent breed",
                PetBreed_Image = "golden_retriever.jpg",
                PetType = new PetType { PetType_ID = Guid.NewGuid(),
                    PetType_Description = "Dog",
                    PetType_Name = "Dog"
                }
            };

            _context.PetBreeds.Add(petBreed);
            await _context.SaveChangesAsync();

            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Test Pet",
                Pet_Gender = true,
                Pet_Note = "Test note",
                Pet_Image = "test.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = petBreed.PetBreed_ID,
                Account_ID = Guid.NewGuid()
            };
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(pet.Pet_ID);

            // Assert
            result.Should().NotBeNull();
            result.Pet_ID.Should().Be(pet.Pet_ID);
            result.Pet_Name.Should().Be("Test Pet");
            result.PetBreed.Should().NotBeNull();
            result.PetBreed.PetBreed_ID.Should().Be(petBreed.PetBreed_ID);
        }

        [Fact]
        public async Task GetByIdAsync_WhenPetDoesNotExist_ReturnNull()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(nonExistentId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetAllAsync_WhenPetsExist_ReturnAllPets()
        {
            // Arrange
            _context.Pets.AddRange(
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Pet 1",
                    Pet_Gender = false,
                    Pet_Note = "Note 1",
                    Pet_Image = "image1.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-2),
                    Pet_Weight = "5kg",
                    Pet_FurType = "Short",
                    Pet_FurColor = "Brown",
                    IsDelete = false,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = Guid.NewGuid()
                },
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Pet 2",
                    Pet_Gender = true,
                    Pet_Note = "Note 2",
                    Pet_Image = "image2.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-3),
                    Pet_Weight = "4kg",
                    Pet_FurType = "Long",
                    Pet_FurColor = "White",
                    IsDelete = false,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = Guid.NewGuid()
                }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCountGreaterThanOrEqualTo(2);
            result.Should().Contain(p => p.Pet_Name == "Pet 1");
            result.Should().Contain(p => p.Pet_Name == "Pet 2");
        }

        [Fact]
        public async Task GetAllAsync_WhenNoPetsExist_ReturnEmptyList()
        {
            // Arrange - no pets added to database
            // Clear any existing pets
            _context.Pets.RemoveRange(_context.Pets);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task UpdateAsync_WhenValidInput_ReturnSuccessResponse()
        {
            // Arrange
            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Original Pet Name",
                Pet_Gender = false,
                Pet_Note = "Original note",
                Pet_Image = "original.jpg",
                Date_Of_Birth = new DateTime(2020, 1, 1),
                Pet_Weight = "50",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            // Create updated pet with same ID
            var updatedPet = new Pet
            {
                Pet_ID = pet.Pet_ID,
                Pet_Name = "Updated Pet Name",
                Pet_Gender = true,
                Pet_Note = "Updated note",
                Pet_Image = "updated.jpg",
                Date_Of_Birth = new DateTime(2019, 1, 1),
                Pet_Weight = "60",
                Pet_FurType = "Long",
                Pet_FurColor = "Black",
                IsDelete = false,
                PetBreed_ID = pet.PetBreed_ID,
                Account_ID = pet.Account_ID
            };

            // Act
            var result = await _repository.UpdateAsync(updatedPet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Pet updated successfully");
            
            // Verify pet was updated in database
            var updatedPetFromDb = await _context.Pets.FindAsync(pet.Pet_ID);
            updatedPetFromDb.Should().NotBeNull();
            updatedPetFromDb.Pet_Name.Should().Be("Updated Pet Name");
            updatedPetFromDb.Pet_Weight.Should().Be("60");
            updatedPetFromDb.Pet_Gender.Should().BeTrue();
        }

        [Fact]
        public async Task UpdateAsync_WhenInvalidInput_ReturnsErrorResponse()
        {
            var existingPet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Valid Pet",
                Pet_Gender = true,
                Pet_Note = "Healthy",
                Pet_Image = "valid.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-3),
                Pet_Weight = "7kg",
                Pet_FurType = "Long",
                Pet_FurColor = "White",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };

            _context.Pets.Add(existingPet);
            await _context.SaveChangesAsync();

            var invalidUpdatePet = new Pet
            {
                Pet_ID = Guid.Empty,  
                Pet_Name = "",        
                Pet_Weight = null    
            };

            // Act
            var result = await _repository.UpdateAsync(invalidUpdatePet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateAsync_WhenPetDoesNotExist_ReturnErrorResponse()
        {
            // Arrange
            var nonExistentPet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Non-existent Pet",
                Pet_Gender = false,
                Pet_Note = "Note",
                Pet_Image = "image.jpg",
                Date_Of_Birth = DateTime.Now,
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };

            // Act
            var result = await _repository.UpdateAsync(nonExistentPet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Pet with ID {nonExistentPet.Pet_ID} not found.");
        }

        [Fact]
        public async Task UpdateAsync_WhenPetNameAlreadyExists_ReturnErrorResponse()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            
            // Create first pet
            var pet1 = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Pet 1",
                Pet_Gender = false,
                Pet_Note = "Note 1",
                Pet_Image = "image1.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = accountId
            };
            
            // Create second pet
            var pet2 = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Pet 2",
                Pet_Gender = true,
                Pet_Note = "Note 2",
                Pet_Image = "image2.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-3),
                Pet_Weight = "4kg",
                Pet_FurType = "Long",
                Pet_FurColor = "White",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = accountId
            };
            
            _context.Pets.AddRange(pet1, pet2);
            await _context.SaveChangesAsync();

            // Try to update pet2 to have the same name as pet1
            var updatedPet2 = new Pet
            {
                Pet_ID = pet2.Pet_ID,
                Pet_Name = "Pet 1", // Same name as pet1
                Pet_Gender = pet2.Pet_Gender,
                Pet_Note = pet2.Pet_Note,
                Pet_Image = pet2.Pet_Image,
                Date_Of_Birth = pet2.Date_Of_Birth,
                Pet_Weight = pet2.Pet_Weight,
                Pet_FurType = pet2.Pet_FurType,
                Pet_FurColor = pet2.Pet_FurColor,
                IsDelete = pet2.IsDelete,
                PetBreed_ID = pet2.PetBreed_ID,
                Account_ID = accountId
            };

            // Act
            var result = await _repository.UpdateAsync(updatedPet2);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Pet with Name {updatedPet2.Pet_Name} already exists!");
        }

        [Fact]
        public async Task DeleteAsync_WhenSoftDelete_ReturnSuccessResponse()
        {
            // Arrange
            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Test Pet",
                Pet_Gender = false,
                Pet_Note = "Test note",
                Pet_Image = "test.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            // Setup HTTP client response - no bookings
            SetupHttpClientResponse(hasBookings: false);

            // Act
            var result = await _repository.DeleteAsync(pet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"Pet {pet.Pet_Name} has been soft deleted successfully.");
            
            // Verify pet was soft deleted in database
            var deletedPet = await _context.Pets.FindAsync(pet.Pet_ID);
            deletedPet.Should().NotBeNull();
            deletedPet.IsDelete.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_WhenHardDelete_ReturnSuccessResponse()
        {
            // Arrange
            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Test Pet",
                Pet_Gender = false,
                Pet_Note = "Test note",
                Pet_Image = "test.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = true, // Already soft deleted
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            // Setup HTTP client response - no bookings
            SetupHttpClientResponse(hasBookings: false);

            // Act
            var result = await _repository.DeleteAsync(pet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"Pet {pet.Pet_Name} has been permanently deleted.");
            
            // Verify pet was hard deleted from database
            var deletedPet = await _context.Pets.FindAsync(pet.Pet_ID);
            deletedPet.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_WhenPetNotFound_ReturnErrorResponse()
        {
            // Arrange
            var nonExistentPet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Non-existent Pet",
                Pet_Gender = false,
                Pet_Note = "Note",
                Pet_Image = "image.jpg",
                Date_Of_Birth = DateTime.Now,
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };

            // Act
            var result = await _repository.DeleteAsync(nonExistentPet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Pet with ID {nonExistentPet.Pet_ID} not found.");
        }

        [Fact]
        public async Task DeleteAsync_WhenPetHasBookings_ReturnErrorResponse()
        {
            // Arrange
            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Test Pet",
                Pet_Gender = false,
                Pet_Note = "Test note",
                Pet_Image = "test.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            // Setup HTTP client response - pet has bookings
            SetupHttpClientResponse(hasBookings: true);

            // Act
            var result = await _repository.DeleteAsync(pet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Pet {pet.Pet_Name} cannot be deleted because it has associated bookings.");
            
            // Verify pet was not deleted
            var petFromDb = await _context.Pets.FindAsync(pet.Pet_ID);
            petFromDb.Should().NotBeNull();
            petFromDb.IsDelete.Should().BeFalse();
        }

        [Fact]
        public async Task DeleteAsync_WhenHttpRequestFails_ReturnErrorResponse()
        {
            // Arrange
            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Test Pet",
                Pet_Gender = false,
                Pet_Note = "Test note",
                Pet_Image = "test.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            // Setup HTTP client response - request fails
            SetupHttpClientResponse(hasBookings: false, isSuccessful: false);

            // Act
            var result = await _repository.DeleteAsync(pet);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Failed to check bookings for the pet.");
            
            // Verify pet was not deleted
            var petFromDb = await _context.Pets.FindAsync(pet.Pet_ID);
            petFromDb.Should().NotBeNull();
            petFromDb.IsDelete.Should().BeFalse();
        }

        [Fact]
        public async Task ListAvailablePetAsync_WhenAvailablePetsExist_ReturnAvailablePets()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            
            _context.Pets.AddRange(
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Available Pet 1", 
                    Pet_Gender = false,
                    Pet_Note = "Note 1",
                    Pet_Image = "image1.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-2),
                    Pet_Weight = "5kg",
                    Pet_FurType = "Short",
                    Pet_FurColor = "Brown",
                    IsDelete = false,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = accountId 
                },
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Available Pet 2", 
                    Pet_Gender = true,
                    Pet_Note = "Note 2",
                    Pet_Image = "image2.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-3),
                    Pet_Weight = "4kg",
                    Pet_FurType = "Long",
                    Pet_FurColor = "White",
                    IsDelete = false,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = accountId 
                },
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Deleted Pet", 
                    Pet_Gender = false,
                    Pet_Note = "Note 3",
                    Pet_Image = "image3.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-1),
                    Pet_Weight = "3kg",
                    Pet_FurType = "Medium",
                    Pet_FurColor = "Black",
                    IsDelete = true,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = accountId 
                },
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Other Account Pet", 
                    Pet_Gender = true,
                    Pet_Note = "Note 4",
                    Pet_Image = "image4.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-4),
                    Pet_Weight = "6kg",
                    Pet_FurType = "Short",
                    Pet_FurColor = "Gray",
                    IsDelete = false,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = Guid.NewGuid() 
                }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailablePetAsync(accountId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().OnlyContain(p => p.Account_ID == accountId && !p.IsDelete);
            result.Should().Contain(p => p.Pet_Name == "Available Pet 1");
            result.Should().Contain(p => p.Pet_Name == "Available Pet 2");
        }

        [Fact]
        public async Task ListAvailablePetAsync_WhenNoAvailablePets_ReturnEmptyList()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            
            // Add only deleted pets or pets from other accounts
            _context.Pets.AddRange(
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Deleted Pet", 
                    Pet_Gender = false,
                    Pet_Note = "Note 1",
                    Pet_Image = "image1.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-2),
                    Pet_Weight = "5kg",
                    Pet_FurType = "Short",
                    Pet_FurColor = "Brown",
                    IsDelete = true,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = accountId 
                },
                new Pet { 
                    Pet_ID = Guid.NewGuid(), 
                    Pet_Name = "Other Account Pet", 
                    Pet_Gender = true,
                    Pet_Note = "Note 2",
                    Pet_Image = "image2.jpg",
                    Date_Of_Birth = DateTime.Now.AddYears(-3),
                    Pet_Weight = "4kg",
                    Pet_FurType = "Long",
                    Pet_FurColor = "White",
                    IsDelete = false,
                    PetBreed_ID = Guid.NewGuid(),
                    Account_ID = Guid.NewGuid() 
                }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailablePetAsync(accountId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetByAsync_WhenPetExists_ReturnPet()
        {
            // Arrange
            var pet = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                Pet_Name = "Test Pet",
                Pet_Gender = true,
                Pet_Note = "Test note",
                Pet_Image = "test.jpg",
                Date_Of_Birth = DateTime.Now.AddYears(-2),
                Pet_Weight = "5kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown",
                IsDelete = false,
                PetBreed_ID = Guid.NewGuid(),
                Account_ID = Guid.NewGuid()
            };
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByAsync(p => p.Pet_ID == pet.Pet_ID);

            // Assert
            result.Should().NotBeNull();
            result.Pet_ID.Should().Be(pet.Pet_ID);
            result.Pet_Name.Should().Be("Test Pet");
            result.Pet_Gender.Should().BeTrue();
        }

        [Fact]
        public async Task GetByAsync_WhenPetDoesNotExist_ThrowInvalidOperationException()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _repository.GetByAsync(p => p.Pet_ID == nonExistentId));
        }
    }
}
