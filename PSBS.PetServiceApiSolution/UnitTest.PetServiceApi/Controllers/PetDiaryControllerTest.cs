using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using PetApi.Application.DTOs;
using PetApi.Application.Interfaces;
using PetApi.Domain.Entities;
using PetApi.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.PetServiceApi.Controllers
{
    public class PetDiaryControllerTest
    {
        private readonly IPetDiary _diary;
        private readonly IPet _pet;
        private readonly PetDiaryController _controller;

        public PetDiaryControllerTest()
        {
            _pet = A.Fake<IPet>();
            _diary = A.Fake<IPetDiary>();
            _controller = new PetDiaryController(_diary, _pet);
        }

        [Fact]
        public async Task GetCategoriesByPetId_ShouldReturnNotFound_WhenPetNotFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            A.CallTo(() => _pet.GetByIdAsync(petId)).Returns(Task.FromResult<Pet?>(null));

            // Act
            var result = await _controller.GetCategoriesByPetId(petId);

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>()
                .Which.Value.Should().BeEquivalentTo(new Response(false, $"Pet with GUID {petId} not found or is deleted"));
        }

        [Fact]
        public async Task GetCategoriesByPetId_ShouldReturnNotFound_WhenNoCategoriesFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var fakePet = new Pet { Pet_ID = petId }; // Fake pet exists
            A.CallTo(() => _pet.GetByIdAsync(petId)).Returns(Task.FromResult(fakePet));
            A.CallTo(() => _diary.GetAllCategories(petId)).Returns(Task.FromResult((IEnumerable<string>)new List<string>()));

            // Act
            var result = await _controller.GetCategoriesByPetId(petId);

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>()
                .Which.Value.Should().BeEquivalentTo(new Response(false, "No categories found in the database"));
        }

        [Fact]
        public async Task GetCategoriesByPetId_ShouldReturnOk_WhenCategoriesFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var fakePet = new Pet { Pet_ID = petId }; // Fake pet exists
            var fakeCategories = new List<string> { "Category1", "Category2" };

            A.CallTo(() => _pet.GetByIdAsync(petId)).Returns(Task.FromResult(fakePet));
            A.CallTo(() => _diary.GetAllCategories(petId))
     .Returns(Task.FromResult((IEnumerable<string>)fakeCategories));


            // Act
            var result = await _controller.GetCategoriesByPetId(petId);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(new Response(true, "Diary categories retrieved successfully")
                {
                    Data = new { data = fakeCategories }
                });
        }

        [Fact]
        public async Task GetDiariesByCategory_NoDiariesFound_ReturnsNotFound()
        {
            // Arrange
            string category = "Health";
            A.CallTo(() => _diary.GetDiariesByCategory(category)).Returns(Task.FromResult(Enumerable.Empty<PetDiary>()));

            // Act
            var result = await _controller.GetDiariesByCategory(category);

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetDiariesByCategory_DiariesRetrievedSuccessfully_ReturnsOk()
        {
            // Arrange
            string category = "Health";
            var fakeDiaries = new List<PetDiary> { new PetDiary { Diary_ID = Guid.NewGuid(), Category = category } };
            A.CallTo(() => _diary.GetDiariesByCategory(category)).Returns(Task.FromResult(fakeDiaries.AsEnumerable()));

            // Act
            var result = await _controller.GetDiariesByCategory(category);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task GetPetDiaryListByPetId_PetNotFound_ReturnsNotFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            A.CallTo(() => _pet.GetByIdAsync(petId)).Returns(Task.FromResult<Pet>(null));

            // Act
            var result = await _controller.GetPetDiaryListByPetId(null, petId, 1, 4);

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetPetDiaryListByPetId_NoDiariesFound_ReturnsNotFound()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var pet = new Pet { Pet_ID = petId };
            A.CallTo(() => _pet.GetByIdAsync(petId)).Returns(Task.FromResult(pet));
            A.CallTo(() => _diary.GetAllDiariesByPetIdsAsync(null, petId, 1, 4))
                .Returns(Task.FromResult((Enumerable.Empty<PetDiary>(), 0)));

            // Act
            var result = await _controller.GetPetDiaryListByPetId(null, petId, 1, 4);

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetPetDiaryListByPetId_DiariesRetrievedSuccessfully_ReturnsOk()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var pet = new Pet
            {
                Pet_ID = petId,
                Pet_Name = "Fluffy",
                Pet_Image = "fluffy.jpg",
                Date_Of_Birth = new DateTime(2020, 1, 1)
            };

            var fakeDiaries = new List<PetDiary>
    {
        new PetDiary
        {
            Diary_ID = Guid.NewGuid(),
            Pet_ID = petId,
            Diary_Content = "Went for a walk",
            Diary_Date = DateTime.UtcNow,
            Category = "Daily Routine",
            Pet = pet
        }
    };

            A.CallTo(() => _pet.GetByIdAsync(petId)).Returns(Task.FromResult(pet));
            A.CallTo(() => _diary.GetAllDiariesByPetIdsAsync(null, petId, 1, 4))
                .Returns(Task.FromResult((fakeDiaries.AsEnumerable(), fakeDiaries.Count)));

            // Act
            var result = await _controller.GetPetDiaryListByPetId(null, petId, 1, 4);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }


        [Fact]
        public async Task CreatePetDiary_DiaryCreatedSuccessfully_ReturnsOk()
        {
            // Arrange
            var createDto = new CreatePetDiaryDTO { Category = "Health", Diary_Content = "Test content" };
            var response = new Response(true, "Diary created successfully");

            A.CallTo(() => _diary.CreateAsync(A<PetDiary>._)).Returns(Task.FromResult(response));

            // Act
            var result = await _controller.CreatePetDiary(createDto);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task UpdatePetDiary_PetNotFound_ReturnsNotFound()
        {
            // Arrange
            var diaryId = Guid.NewGuid();
            var updateDto = new UpdatePetDiaryDTO { Category = "Updated", Diary_Content = "Updated content" };

            A.CallTo(() => _diary.GetByIdAsync(diaryId)).Returns(Task.FromResult<PetDiary>(null));

            // Act
            var result = await _controller.UpdatePetDiary(diaryId, updateDto);

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task UpdatePetDiary_FailedToUpdate_ReturnsBadRequest()
        {
            // Arrange
            var diaryId = Guid.NewGuid();
            var existingDiary = new PetDiary { Diary_ID = diaryId, Category = "Health", Diary_Content = "Content" };
            var updateDto = new UpdatePetDiaryDTO { Category = "Updated", Diary_Content = "Updated content" };
            var failedResponse = new Response(false, "Failed to update pet diary.");

            A.CallTo(() => _diary.GetByIdAsync(diaryId)).Returns(Task.FromResult(existingDiary));
            A.CallTo(() => _diary.UpdateAsync(A<PetDiary>._)).Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _controller.UpdatePetDiary(diaryId, updateDto);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task DeletePetDiary_PetDiaryNotFound_ReturnsNotFound()
        {
            // Arrange
            var diaryId = Guid.NewGuid();

            A.CallTo(() => _diary.GetByIdAsync(diaryId)).Returns(Task.FromResult<PetDiary>(null));

            // Act
            var result = await _controller.DeletePetDiary(diaryId);

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task DeletePetDiary_DeleteSuccessful_ReturnsOk()
        {
            // Arrange
            var diaryId = Guid.NewGuid();
            var existingDiary = new PetDiary { Diary_ID = diaryId };
            var successResponse = new Response(true, "Diary deleted successfully");

            A.CallTo(() => _diary.GetByIdAsync(diaryId)).Returns(Task.FromResult(existingDiary));
            A.CallTo(() => _diary.DeleteAsync(existingDiary)).Returns(Task.FromResult(successResponse));

            // Act
            var result = await _controller.DeletePetDiary(diaryId);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }
    }
}
