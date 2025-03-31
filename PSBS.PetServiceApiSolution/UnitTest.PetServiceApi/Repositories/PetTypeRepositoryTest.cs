using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PetApi.Infrastructure.Repositories;

namespace UnitTest.PetServiceApi.Repositories
{
    public class PetTypeRepositoryTests : IDisposable
    {
        private readonly PetDbContext _context;
        private readonly PetTypeRepository _repository;

        public PetTypeRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<PetDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new PetDbContext(options);
            _repository = new PetTypeRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_WithValidPetType_ShouldReturnSuccessResponse()
        {
            // Arrange
            var petType = new PetType
            {
                PetType_ID = Guid.NewGuid(),
                PetType_Name = "Dog",
                PetType_Image = null,
                PetType_Description = "aaa",
                IsDelete = false
            };

            // Act
            var result = await _repository.CreateAsync(petType);
            await _context.SaveChangesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Dog added to database successfully");

            var petTypeInDb = await _context.PetTypes.FirstOrDefaultAsync(p => p.PetType_ID == petType.PetType_ID);
            petTypeInDb.Should().NotBeNull();
            petTypeInDb.PetType_Name.Should().Be("Dog");
        }

        [Fact]
        public async Task DeleteAsync_WhenPetTypeNotFound_ShouldReturnNotFoundResponse()
        {
            // Arrange
            var petType = new PetType
            {
                PetType_ID = Guid.NewGuid(),
                PetType_Name = "UnknownPet"
            };

            // Act
            var result = await _repository.DeleteAsync(petType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("UnknownPet not found");
        }


        [Fact]
        public async Task DeleteAsync_WhenPetTypeExists_ShouldReturnSuccessResponse()
        {
            // Arrange
            var petType = new PetType
            {
                PetType_ID = Guid.NewGuid(),
                PetType_Name = "Dog",
                PetType_Image = null,
                PetType_Description = "aaa",
                IsDelete = false
            };


            _context.PetTypes.Add(petType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteAsync(petType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Dog is marked as soft deleted  successfully");

            var deletedPetType = await _context.PetTypes.FindAsync(petType.PetType_ID);
            deletedPetType.Should().NotBeNull();
            deletedPetType.IsDelete.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteSecondAsync_WhenPetTypeExists_ShouldDeletePermanently()
        {
            // Arrange
            var petType = new PetType
            {
                PetType_ID = Guid.NewGuid(),
                PetType_Name = "Cat",
                PetType_Image = null,
                PetType_Description = "aaa",
                IsDelete = true
            };

            _context.PetTypes.Add(petType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.DeleteSecondAsync(petType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{petType.PetType_ID} is deleted permanently successfully");

            var deletedPetType = await _context.PetTypes.FindAsync(petType.PetType_ID);
            deletedPetType.Should().BeNull();
        }

        [Fact]
        public async Task GetAllAsync_WhenPetTypesExist_ShouldReturnListOfPetTypes()
        {
            // Arrange
            var petTypes = new List<PetType>
    {
        new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Dog",
        PetType_Image = null,PetType_Description = "aaa", IsDelete=false},
        new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Cat",
        PetType_Image = null,PetType_Description = "aaa", IsDelete=false }
    };

            _context.PetTypes.AddRange(petTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(p => p.PetType_Name == "Dog");
            result.Should().Contain(p => p.PetType_Name == "Cat");
        }

        [Fact]
        public async Task GetAllAsync_WhenNoPetTypesExist_ShouldReturnEmptyList()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }


        [Fact]
        public async Task GetByIdAsync_WhenPetTypeExists_ShouldReturnPetType()
        {
            // Arrange
            var petType = new PetType
            {
                PetType_ID = Guid.NewGuid(),
                PetType_Name = "Dog",
                PetType_Image = null,
                PetType_Description = "Description",
                IsDelete = false
            };

            _context.PetTypes.Add(petType);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(petType.PetType_ID);

            // Assert
            result.Should().NotBeNull();
            result.PetType_ID.Should().Be(petType.PetType_ID);
            result.PetType_Name.Should().Be("Dog");
            result.PetType_Image.Should().BeNull();
            result.PetType_Description.Should().Be("Description");
            result.IsDelete.Should().BeFalse();
        }

        [Fact]
        public async Task GetByIdAsync_WhenPetTypeDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(nonExistentId);

            // Assert
            result.Should().BeNull();
        }


        [Fact]
        public async Task UpdateAsync_WhenPetTypeDoesNotExist_ShouldReturnNotFoundResponse()
        {
            // Arrange
            var petType = new PetType
            {
                PetType_ID = Guid.NewGuid(),
                PetType_Name = "Dog",
                PetType_Image = null,
                PetType_Description = "Description",
                IsDelete = false
            };

            // Act
            var result = await _repository.UpdateAsync(petType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Dog not found");
        }

        [Fact]
        public async Task UpdateAsync_WhenPetTypeExists_ShouldReturnSuccessResponse()
        {
            // Arrange
            var petType = new PetType
            {
                PetType_ID = Guid.NewGuid(),
                PetType_Name = "Dog",
                PetType_Image = null,
                PetType_Description = "Description",
                IsDelete = false
            };

            _context.PetTypes.Add(petType);
            await _context.SaveChangesAsync();

            var updatedPetType = new PetType
            {
                PetType_ID = petType.PetType_ID,
                PetType_Name = "Updated Dog",
                PetType_Image = null,
                PetType_Description = "Updated Description",
                IsDelete = false
            };

            // Act
            var result = await _repository.UpdateAsync(updatedPetType);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Updated Dog is updated successfully");

            var petInDb = await _context.PetTypes.FindAsync(updatedPetType.PetType_ID);
            petInDb.Should().NotBeNull();
            petInDb.PetType_Name.Should().Be("Updated Dog");
            petInDb.PetType_Description.Should().Be("Updated Description");
        }

        [Fact]
        public async Task ListAvailablePetTypeAsync_WhenCalled_ShouldReturnAvailablePetTypes()
        {
            // Arrange
            var petTypes = new List<PetType>
    {
        new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Dog", PetType_Image = null, PetType_Description = "Description", IsDelete = false },
        new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Cat", PetType_Image = null, PetType_Description = "Description", IsDelete = false },
        new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Bird", PetType_Image = null, PetType_Description = "Description", IsDelete = true }
    };

            _context.PetTypes.AddRange(petTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailablePetTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(p => p.PetType_Name == "Dog");
            result.Should().Contain(p => p.PetType_Name == "Cat");
            result.Should().NotContain(p => p.PetType_Name == "Bird"); // Bird is soft-deleted
        }

        [Fact]
        public async Task ListAvailablePetTypeAsync_WhenNoAvailablePetTypesExist_ShouldReturnEmptyList()
        {
            // Arrange
            var petTypes = new List<PetType>
    {
        new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Dog", PetType_Image = null, PetType_Description = "Description", IsDelete = true },
        new PetType { PetType_ID = Guid.NewGuid(), PetType_Name = "Cat", PetType_Image = null, PetType_Description = "Description", IsDelete = true }
    };

            _context.PetTypes.AddRange(petTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListAvailablePetTypeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }

}
