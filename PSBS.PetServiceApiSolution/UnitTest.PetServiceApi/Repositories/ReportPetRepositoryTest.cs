using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PetApi.Application.DTOs;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PetApi.Infrastructure.Repositories;

namespace UnitTest.PetServiceApi.Repositories
{
    public class ReportPetRepositoryTest
    {
        private readonly PetDbContext _context;
        private readonly ReportPetRepository _repository;

        public ReportPetRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<PetDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new PetDbContext(options);
            _repository = new ReportPetRepository(_context);
        }

        [Fact]
        public async Task GetPetBreedByPetCoutDTO_WhenPetsExist_ShouldReturnCorrectCounts()
        {
            // Arrange
            var petBreed1 = new PetBreed
            {
                PetBreed_ID = Guid.NewGuid(),
                PetBreed_Name = "Bulldog",
                PetBreed_Description = "A strong, muscular breed",
                PetBreed_Image = "bulldog.jpg",
                IsDelete = false,
                PetType_ID = Guid.NewGuid()
            };

            var petBreed2 = new PetBreed
            {
                PetBreed_ID = Guid.NewGuid(),
                PetBreed_Name = "Poodle",
                PetBreed_Description = "An intelligent and active breed",
                PetBreed_Image = "poodle.jpg",
                IsDelete = false,
                PetType_ID = Guid.NewGuid()
            };


            await _context.PetBreeds.AddRangeAsync(petBreed1, petBreed2);
            await _context.SaveChangesAsync();

            var pet1 = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                PetBreed_ID = petBreed1.PetBreed_ID,
                IsDelete = false,
                Account_ID = Guid.NewGuid(),
                Pet_Name = "Buddy",
                Pet_Gender = true,
                Pet_Note = "",
                Date_Of_Birth = DateTime.UtcNow,
                Pet_Weight = "10kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Brown"
            };

            var pet2 = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                PetBreed_ID = petBreed1.PetBreed_ID,
                IsDelete = false,
                Account_ID = Guid.NewGuid(),
                Pet_Name = "Max",
                Pet_Gender = true,
                Pet_Note = "",
                Date_Of_Birth = DateTime.UtcNow,
                Pet_Weight = "12kg",
                Pet_FurType = "Short",
                Pet_FurColor = "Black"
            };

            var pet3 = new Pet
            {
                Pet_ID = Guid.NewGuid(),
                PetBreed_ID = petBreed2.PetBreed_ID,
                IsDelete = false,
                Account_ID = Guid.NewGuid(),
                Pet_Name = "Charlie",
                Pet_Gender = false,
                Pet_Note = "",
                Date_Of_Birth = DateTime.UtcNow,
                Pet_Weight = "8kg",
                Pet_FurType = "Curly",
                Pet_FurColor = "White"
            };

            await _context.Pets.AddRangeAsync(pet1, pet2, pet3);
            await _context.SaveChangesAsync();

            var dtos = new List<PetCountDTO>
    {
        new PetCountDTO(pet1.Pet_ID, 1),
        new PetCountDTO(pet2.Pet_ID, 2),
        new PetCountDTO(pet3.Pet_ID, 3)
    };

            // Act
            var result = await _repository.GetPetBreedByPetCoutDTO(dtos);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().ContainKey("Bulldog").WhoseValue.Should().Be(3);
            result.Should().ContainKey("Poodle").WhoseValue.Should().Be(3);

        }


    }
}
