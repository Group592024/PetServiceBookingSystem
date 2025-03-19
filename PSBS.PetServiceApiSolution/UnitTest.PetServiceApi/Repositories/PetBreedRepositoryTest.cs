using FluentAssertions;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PetApi.Infrastructure.Repositories;
using System.Reflection;

namespace UnitTest.PetServiceApi.Repositories;
public class PetBreedRepositoryTests
{
    private readonly PetDbContext _context;
    private readonly PetBreedRepository _repository;

    public PetBreedRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<PetDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new PetDbContext(options);
        _repository = new PetBreedRepository(_context);
    }

    [Fact]
    public async Task CreateAsync_WhenValidInput_ReturnsSuccessResponse()
    {
        // Arrange
        var breed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Golden Retriever",
            PetType_ID = Guid.NewGuid(),
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png",
            IsDelete = false
        };

        // Act
        var result = await _repository.CreateAsync(breed);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeTrue();
        result.Message.Should().Be("Golden Retriever added successfully");
        
        // Verify breed was added to database
        var savedBreed = await _context.PetBreeds.FindAsync(breed.PetBreed_ID);
        savedBreed.Should().NotBeNull();
        savedBreed.PetBreed_Name.Should().Be("Golden Retriever");
    }
    
    [Fact]
    public async Task CreateAsync_WhenBreedNameAlreadyExists_ReturnsErrorResponse()
    {
        // Arrange
        var petTypeId = Guid.NewGuid();
        var existingBreed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Labrador Retriever",
            PetType_ID = petTypeId,
            IsDelete = false,
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png"
        };
    _context.PetBreeds.Add(existingBreed);
        await _context.SaveChangesAsync();
    var newBreed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Labrador Retriever", // Same name
            PetType_ID = petTypeId, // Same pet type
            IsDelete = false
        };
        
        // Act
        var result = await _repository.CreateAsync(newBreed);
        
        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeFalse();
        result.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task DeleteAsync_WhenBreedNotExists_ReturnsErrorResponse()
    {
        // Arrange
        var breed = new PetBreed { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Unknown Breed" };

        // Act
        var result = await _repository.DeleteAsync(breed);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
    
    [Fact]
    public async Task DeleteAsync_WhenBreedExists_SoftDeletesSuccessfully()
    {
        // Arrange
        var breed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Dachshund",
            PetType_ID = Guid.NewGuid(),
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png",
            IsDelete = false
        };
        
        _context.PetBreeds.Add(breed);
        await _context.SaveChangesAsync();
        
        // Act
        var result = await _repository.DeleteAsync(breed);
        
        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeTrue();
        result.Message.Should().Contain("soft deleted");
        
        // Verify breed was soft deleted
        var deletedBreed = await _context.PetBreeds.FindAsync(breed.PetBreed_ID);
        deletedBreed.Should().NotBeNull();
        deletedBreed.IsDelete.Should().BeTrue();
    }
    
    [Fact]
    public async Task DeleteAsync_WhenBreedAlreadySoftDeleted_HardDeletesSuccessfully()
    {
        // Arrange
        var breed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Shih Tzu",
            PetType_ID = Guid.NewGuid(),
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png",
            IsDelete = true // Already soft deleted
        };
        
        _context.PetBreeds.Add(breed);
        await _context.SaveChangesAsync();
        
        // Act
        var result = await _repository.DeleteAsync(breed);
        
        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeTrue();
        result.Message.Should().Contain("permanently deleted");
        
        // Verify breed was hard deleted
        var deletedBreed = await _context.PetBreeds.FindAsync(breed.PetBreed_ID);
        deletedBreed.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WhenBreedHasAssociatedPets_ReturnsErrorResponse()
    {
        // Arrange
        var breedId = Guid.NewGuid();
        var breed = new PetBreed
        {
            PetBreed_ID = breedId,
            PetBreed_Name = "Pomeranian",
            PetType_ID = Guid.NewGuid(),
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png",
            IsDelete = true
        };

        _context.PetBreeds.Add(breed);

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
            PetBreed_ID = breedId, 
            Account_ID = Guid.NewGuid()
        };

        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteAsync(breed);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeFalse(); 
    }


    [Fact]
    public async Task GetByIdAsync_WhenBreedExists_ReturnsBreed()
    {
        // Arrange
        var breed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Bulldog",
            PetType_ID = Guid.NewGuid(),
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png",
            IsDelete = false
        };
        _context.PetBreeds.Add(breed);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(breed.PetBreed_ID);

        // Assert
        result.Should().NotBeNull();
        result.PetBreed_Name.Should().Be("Bulldog");
    }
    
    [Fact]
    public async Task GetByIdAsync_WhenBreedDoesNotExist_ReturnsNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        
        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_WhenBreedExists_UpdatesSuccessfully()
    {
        // Arrange
        var breed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Poodle",
            PetType_ID = Guid.NewGuid(),
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png",
            IsDelete = false
        };
        _context.PetBreeds.Add(breed);
        await _context.SaveChangesAsync();

        breed.PetBreed_Name = "Updated Poodle";

        // Act
        var result = await _repository.UpdateAsync(breed);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeTrue();
        result.Message.Should().Be("Pet breed updated successfully");
        
        // Verify breed was updated in database
        var updatedBreed = await _context.PetBreeds.FindAsync(breed.PetBreed_ID);
        updatedBreed.Should().NotBeNull();
        updatedBreed.PetBreed_Name.Should().Be("Updated Poodle");
    }
    
    [Fact]
    public async Task UpdateAsync_WhenBreedDoesNotExist_ReturnsErrorResponse()
    {
        // Arrange
        var breed = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Non-existent Breed",
            PetType_ID = Guid.NewGuid(),
            IsDelete = false
        };
        
        // Act
        var result = await _repository.UpdateAsync(breed);
        
        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
    
    [Fact]
    public async Task UpdateAsync_WhenNameAlreadyExists_ReturnsErrorResponse()
    {
        // Arrange
        var petTypeId = Guid.NewGuid();
        
        // Create first breed
        var breed1 = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Husky",
            PetType_ID = petTypeId,
            PetBreed_Description = "Breed",
            PetBreed_Image = "breed.png",
            IsDelete = false
        };
        
        // Create second breed
        var breed2 = new PetBreed
        {
            PetBreed_ID = Guid.NewGuid(),
            PetBreed_Name = "Malamute",
            PetType_ID = petTypeId,
            PetBreed_Description = "Breed1",
            PetBreed_Image = "breed1.png",
            IsDelete = false
        };
        
        _context.PetBreeds.AddRange(breed1, breed2);
        await _context.SaveChangesAsync();
        
        // Try to update breed2 to have the same name as breed1
        breed2.PetBreed_Name = "Husky";
        
        // Act
        var result = await _repository.UpdateAsync(breed2);
        
        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeFalse();
        result.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllBreeds()
    {
        // Arrange
        _context.PetBreeds.AddRange(new List<PetBreed>
        {
            new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Beagle", PetBreed_Description = "Breed", PetBreed_Image = "breed.png"},
            new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Labrador", PetBreed_Description = "Breed1", PetBreed_Image = "breed1.png"}
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }
    
    [Fact]
    public async Task GetAllAsync_WhenNoBreeds_ReturnsEmptyList()
        {
            // Arrange - no breeds added
            
            // Act
            var result = await _repository.GetAllAsync();
            
            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
        
    [Fact]
    public async Task GetBreedsByPetTypeAsync_WhenNoMatchingBreeds_ReturnsEmptyList()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();
            var differentPetTypeId = Guid.NewGuid();
            
            _context.PetBreeds.AddRange(new List<PetBreed>
            {
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Chihuahua", PetType_ID = petTypeId , PetBreed_Description = "Breed", PetBreed_Image = "breed.png" },
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Maltese", PetType_ID = petTypeId , PetBreed_Description = "Breed1", PetBreed_Image = "breed1.png" }
            });
            await _context.SaveChangesAsync();
            
            // Act
            var result = await _repository.GetBreedsByPetTypeIdAsync(differentPetTypeId);
            
            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
        
    [Fact]
    public async Task GetBreedsByPetTypeAsync_ExcludesSoftDeletedBreeds()
        {
            // Arrange
            var petTypeId = Guid.NewGuid();
            _context.PetBreeds.AddRange(new List<PetBreed>
            {
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Chihuahua", PetType_ID = petTypeId, PetBreed_Description = "Breed", PetBreed_Image = "breed.png", IsDelete = false },
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Maltese", PetType_ID = petTypeId, PetBreed_Description = "Breed1", PetBreed_Image = "breed1.png", IsDelete = true }
            });
            await _context.SaveChangesAsync();
            
            // Act
            var result = await _repository.GetBreedsByPetTypeIdAsync(petTypeId);
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.Should().Contain(b => b.PetBreed_Name == "Chihuahua");
            result.Should().NotContain(b => b.PetBreed_Name == "Maltese");
        }
        
    [Fact]
    public async Task GetByAsync_WhenBreedExists_ReturnsBreed()
        {
            // Arrange
            var breed = new PetBreed
            {
                PetBreed_ID = Guid.NewGuid(),
                PetBreed_Name = "Corgi",
                PetType_ID = Guid.NewGuid(),
                PetBreed_Description = "Breed",
                PetBreed_Image = "breed.png",
                IsDelete = false
            };
            _context.PetBreeds.Add(breed);
            await _context.SaveChangesAsync();
            
            // Act
            var result = await _repository.GetByAsync(b => b.PetBreed_Name == "Corgi");
            
            // Assert
            result.Should().NotBeNull();
            result.PetBreed_ID.Should().Be(breed.PetBreed_ID);
            result.PetBreed_Name.Should().Be("Corgi");
        }
        
    [Fact]
    public async Task GetByAsync_WhenBreedDoesNotExist_ThrowsException()
        {
            // Arrange - no breeds with the name "NonExistentBreed"
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _repository.GetByAsync(b => b.PetBreed_Name == "NonExistentBreed"));
        }
        
    [Fact]
    public async Task ListAvailablePetBreedAsync_ReturnsOnlyNonDeletedBreeds()
        {
            // Arrange
            _context.PetBreeds.AddRange(new List<PetBreed>
            {
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Beagle", PetBreed_Description = "Breed", PetBreed_Image = "breed.png", IsDelete = false },
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Labrador", PetBreed_Description = "Breed1", PetBreed_Image = "breed1.png", IsDelete = false },
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Pug", PetBreed_Description = "Breed2", PetBreed_Image = "breed2.png", IsDelete = true }
            });
            await _context.SaveChangesAsync();
            
            // Act
            var result = await _repository.ListAvailablePetBreedAsync();
            
            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(b => b.PetBreed_Name == "Beagle");
            result.Should().Contain(b => b.PetBreed_Name == "Labrador");
            result.Should().NotContain(b => b.PetBreed_Name == "Pug");
        }
        
    [Fact]
    public async Task ListAvailablePetBreedAsync_WhenNoAvailableBreeds_ReturnsEmptyList()
        {
            // Arrange
            _context.PetBreeds.AddRange(new List<PetBreed>
            {
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Beagle", PetBreed_Description = "Breed", PetBreed_Image = "breed.png", IsDelete = true },
                new() { PetBreed_ID = Guid.NewGuid(), PetBreed_Name = "Labrador", PetBreed_Description = "Breed1", PetBreed_Image = "breed1.png", IsDelete = true }
            });
            await _context.SaveChangesAsync();
            
            // Act
            var result = await _repository.ListAvailablePetBreedAsync();
            
            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }
}
