using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PetApi.Domain.Entities;
using PetApi.Infrastructure.Data;
using PetApi.Infrastructure.Repositories;

namespace UnitTest.PetServiceApi.Repositories
{
    public class PetDiaryRepositoryTest
    {
        private readonly DbContextOptions<PetDbContext> _options;
        private readonly PetDbContext _context;
        private readonly PetDiaryRepository _repository;

        public PetDiaryRepositoryTest()
        {
            _options = new DbContextOptionsBuilder<PetDbContext>()
                .UseInMemoryDatabase(databaseName: "PetDiaryDb")
                .Options;
            _context = new PetDbContext(_options);
            _repository = new PetDiaryRepository(_context);
        }

        [Fact]
        public async Task GetAllCategories_ShouldReturnEmptyList_WhenNoDiariesExist()
        {
            // Arrange
            var petId = Guid.NewGuid();

            // Act
            var result = await _repository.GetAllCategories(petId);

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetAllCategories_ShouldReturnList_WhenDiariesExist()
        {
            // Arrange
            var petId = Guid.NewGuid();
            _context.PetDiarys.AddRange(
               new PetDiary { Pet_ID = petId, Category = "Health", Diary_Content = "Vet visit" },
        new PetDiary { Pet_ID = petId, Category = "Grooming", Diary_Content = "Spa day" },
        new PetDiary { Pet_ID = petId, Category = "Health", Diary_Content = "Annual checkup" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllCategories(petId);

            // Assert
            result.Should().NotBeEmpty().And.HaveCount(2)
                .And.Contain(new[] { "health", "grooming" });
        }

        [Fact]
        public async Task GetDiariesByCategory_ShouldReturnEmptyList_WhenNoDiariesMatchCategory()
        {
            // Arrange

            _context.Database.EnsureDeleted();
            _context.SaveChanges();

            _context.PetDiarys.Add(new PetDiary { Pet_ID = Guid.NewGuid(), Category = "Health", Diary_Content = "Health content" });
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetDiariesByCategory("Training");

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetDiariesByCategory_ShouldReturnDiaries_WhenMatchingCategoryExists()
        {
            // Arrange

            _context.Database.EnsureDeleted();
            _context.SaveChanges();

            var petId = Guid.NewGuid();
            var diary1 = new PetDiary { Pet_ID = petId, Category = "Training", Diary_Content = "Session 1" };
            var diary2 = new PetDiary { Pet_ID = petId, Category = "Training", Diary_Content = "Session 2" };
            _context.PetDiarys.AddRange(diary1, diary2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetDiariesByCategory("Training");

            // Assert
            result.Should().NotBeEmpty().And.HaveCount(2)
                .And.Contain(d => d.Diary_Content == "Session 1")
                .And.Contain(d => d.Diary_Content == "Session 2");
        }

        [Fact]
        public async Task GetAllDiariesByPetIdsAsync_ShouldReturnEmptyList_WhenNoDiariesExist()
        {
            // Arrange
            Guid petId = Guid.NewGuid();

            // Act
            var (diaries, totalRecords) = await _repository.GetAllDiariesByPetIdsAsync(null, petId);

            // Assert
            diaries.Should().BeEmpty();
            totalRecords.Should().Be(0);
        }

        [Fact]
        public async Task GetAllDiariesByPetIdsAsync_ShouldReturnDiaries_WhenDiariesExist()
        {
            // Arrange
            Guid petId = Guid.NewGuid();
            var diaries = new List<PetDiary>
        {
            new PetDiary { Diary_ID = Guid.NewGuid(), Pet_ID = petId, Category = "Health", Diary_Content = "Vet visit", Diary_Date = DateTime.UtcNow },
            new PetDiary { Diary_ID = Guid.NewGuid(), Pet_ID = petId, Category = "Food", Diary_Content = "New diet", Diary_Date = DateTime.UtcNow }
        };
            await _context.PetDiarys.AddRangeAsync(diaries);
            await _context.SaveChangesAsync();

            // Act
            var (result, totalRecords) = await _repository.GetAllDiariesByPetIdsAsync(null, petId);

            // Assert
            result.Should().HaveCount(2);
            totalRecords.Should().Be(2);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnSuccessResponse_WhenDiaryIsCreated()
        {
            // Arrange
            var diary = new PetDiary { Diary_ID = Guid.NewGuid(), Pet_ID = Guid.NewGuid(), Category = "General", Diary_Content = "First Entry", Diary_Date = DateTime.UtcNow };

            // Act
            var response = await _repository.CreateAsync(diary);

            // Assert
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Pet Diary is added to database successfully");
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnNotFoundResponse_WhenDiaryDoesNotExist()
        {
            // Arrange
            var diary = new PetDiary { Diary_ID = Guid.NewGuid(), Pet_ID = Guid.NewGuid(), Category = "General", Diary_Content = "First Entry", Diary_Date = DateTime.UtcNow };

            // Act
            var response = await _repository.DeleteAsync(diary);

            // Assert
            response.Flag.Should().BeFalse();
            response.Message.Should().Be($"Diary with ID {diary.Diary_ID} not found");
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnSuccessResponse_WhenDiaryExists()
        {
            // Arrange
            var diary = new PetDiary { Diary_ID = Guid.NewGuid(), Pet_ID = Guid.NewGuid(), Category = "General", Diary_Content = "Entry to delete", Diary_Date = DateTime.UtcNow };
            await _context.PetDiarys.AddAsync(diary);
            await _context.SaveChangesAsync();

            // Act
            var response = await _repository.DeleteAsync(diary);

            // Assert
            response.Flag.Should().BeTrue();
            response.Message.Should().Be($"Diary with ID {diary.Diary_ID} is deleted permanently successfully");
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnEmptyList_WhenNoDiariesExist()
        {
            _context.Database.EnsureDeleted();
            _context.SaveChanges();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnList_WhenDiariesExist()
        {
            // Arrange
            var diary = new PetDiary { Diary_ID = Guid.NewGuid(), Category = "Health", Diary_Content = "Checkup", Diary_Date = DateTime.UtcNow };
            await _context.PetDiarys.AddAsync(diary);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeEmpty();
            result.Should().ContainSingle(d => d.Diary_ID == diary.Diary_ID);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenDiaryDoesNotExist()
        {
            // Act
            var result = await _repository.GetByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnDiary_WhenDiaryExists()
        {
            // Arrange
            var diary = new PetDiary { Diary_ID = Guid.NewGuid(), Category = "Exercise", Diary_Content = "Morning walk", Diary_Date = DateTime.UtcNow };
            await _context.PetDiarys.AddAsync(diary);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(diary.Diary_ID);

            // Assert
            result.Should().NotBeNull();
            result.Diary_ID.Should().Be(diary.Diary_ID);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnNotFoundResponse_WhenDiaryDoesNotExist()
        {
            // Arrange
            var nonExistentDiary = new PetDiary { Diary_ID = Guid.NewGuid(), Category = "Food", Diary_Content = "Changed content", Diary_Date = DateTime.UtcNow };

            // Act
            var response = await _repository.UpdateAsync(nonExistentDiary);

            // Assert
            response.Should().NotBeNull();
            response.Flag.Should().BeFalse();
            response.Message.Should().Be($"Diary with ID {nonExistentDiary.Diary_ID} not found");
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnSuccessResponse_WhenDiaryExists()
        {
            // Arrange
            var diary = new PetDiary { Diary_ID = Guid.NewGuid(), Category = "Training", Diary_Content = "Obedience session", Diary_Date = DateTime.UtcNow };
            await _context.PetDiarys.AddAsync(diary);
            await _context.SaveChangesAsync();

            diary.Diary_Content = "Updated content";

            // Act
            var response = await _repository.UpdateAsync(diary);

            // Assert
            response.Should().NotBeNull();
            response.Flag.Should().BeTrue();
            response.Message.Should().Be($"Diary with ID {diary.Diary_ID} is updated successfully");

            var updatedDiary = await _repository.GetByIdAsync(diary.Diary_ID);
            updatedDiary.Diary_Content.Should().Be("Updated content");
        }

    }

}