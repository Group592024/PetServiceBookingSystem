using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FakeItEasy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.DTOs.Conversions;
using PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs; // Nếu cần
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSBS.HealthCareApi.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;
using Xunit;

namespace UnitTest.MedicinesControllerTests
{
    public class PetHealthBookControllerTests : IDisposable
    {
        private readonly IPetHealthBook fakePetHealthBookService;
        private readonly HealthCareDbContext dbContext;
        private readonly PetHealthBookController controller;

        public PetHealthBookControllerTests()
        {
            fakePetHealthBookService = A.Fake<IPetHealthBook>();

            var options = new DbContextOptionsBuilder<HealthCareDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            dbContext = new HealthCareDbContext(options);

            dbContext.Treatments.Add(new PSBS.HealthCareApi.Domain.Treatment
            {
                treatmentId = Guid.NewGuid(),
                treatmentName = "Sample Treatment",
                isDeleted = false
            });
            dbContext.SaveChanges();

            controller = new PetHealthBookController(fakePetHealthBookService);
        }

        public void Dispose()
        {
            dbContext.Database.EnsureDeleted();
            dbContext.Dispose();
        }

        #region GET: GetPetHealthBooks

        [Fact]
        public async Task GetPetHealthBooks_ReturnsNotFound_WhenNoPetHealthBooks()
        {
            A.CallTo(() => fakePetHealthBookService.GetAllAsync())
                .Returns(Task.FromResult(Enumerable.Empty<PSBS.HealthCareApi.Domain.PetHealthBook>()));

            var result = await controller.GetPetHealthBooks();
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = Assert.IsType<Response>(notFoundResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("No PetHealthBooks found", response.Message);
        }

        [Fact]
        public async Task GetPetHealthBooks_ReturnsOk_WithData()
        {
            var petHealthBooks = new List<PSBS.HealthCareApi.Domain.PetHealthBook>
            {
                new PSBS.HealthCareApi.Domain.PetHealthBook
                {
                    healthBookId = Guid.NewGuid(),
                    BookingServiceItemId = Guid.NewGuid(),
                    visitDate = DateTime.UtcNow,
                    nextVisitDate = DateTime.UtcNow.AddDays(30),
                    performBy = "Dr. A",
                    createdAt = DateTime.UtcNow,
                    updatedAt = DateTime.UtcNow,
                    isDeleted = false,
                    medicineIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() }
                }
            };

            A.CallTo(() => fakePetHealthBookService.GetAllAsync())
                .Returns(Task.FromResult((IEnumerable<PSBS.HealthCareApi.Domain.PetHealthBook>)petHealthBooks));

            var result = await controller.GetPetHealthBooks();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal("PetHealthBooks retrieved successfully", response.Message);
            var list = response.Data as IEnumerable<PetHealthBookDTO>;
            Assert.NotNull(list);
            Assert.Single(list);
        }

        #endregion

        #region GET: GetPetHealthBooksById

        [Fact]
        public async Task GetPetHealthBooksById_ReturnsNotFound_WhenNotFound()
        {
            Guid id = Guid.NewGuid();
            A.CallTo(() => fakePetHealthBookService.GetByIdAsync(id))
                .Returns(Task.FromResult<PSBS.HealthCareApi.Domain.PetHealthBook>(null));
            var result = await controller.GetPetHealthBooksById(id);
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = Assert.IsType<Response>(notFoundResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("PetHealthBook not found", response.Message);
        }

        [Fact]
        public async Task GetPetHealthBooksById_ReturnsOk_WithData()
        {
            var petHealthBook = new PSBS.HealthCareApi.Domain.PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(30),
                performBy = "Dr. B",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };

            A.CallTo(() => fakePetHealthBookService.GetByIdAsync(petHealthBook.healthBookId))
                .Returns(Task.FromResult(petHealthBook));

            var result = await controller.GetPetHealthBooksById(petHealthBook.healthBookId);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal("PetHealthBook retrieved successfully", response.Message);
            var dto = response.Data as PetHealthBookDTO;
            Assert.NotNull(dto);
            Assert.Equal("Dr. B", dto.performBy);
        }

        #endregion

        #region POST: CreatePetHealthBooks

        [Fact]
        public async Task CreatePetHealthBooks_ReturnsBadRequest_WhenInvalidInput()
        {
            var petHealthBookDTO = new PetHealthBookDTO(
                healthBookId: Guid.Empty,
                BookingServiceItemId: Guid.NewGuid(),
                visitDate: DateTime.UtcNow,
                nextVisitDate: null,
                performBy: "Dr. C",
                createdAt: DateTime.UtcNow,
                updatedAt: DateTime.UtcNow,
                isDeleted: false,
                medicineIds: new List<Guid> { Guid.NewGuid() }
            );
            var result = await controller.CreatePetHealthBooks(petHealthBookDTO);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<Response>(badRequestResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("HealthBookId cannot be null or empty", response.Message);
        }

        [Fact]
        public async Task CreatePetHealthBooks_ReturnsOk_WhenCreatedSuccessfully()
        {
            var petHealthBookDTO = new PetHealthBookDTO(
                healthBookId: Guid.NewGuid(),
                BookingServiceItemId: Guid.NewGuid(),
                visitDate: DateTime.UtcNow,
                nextVisitDate: DateTime.UtcNow.AddDays(15),
                performBy: "Dr. D",
                createdAt: DateTime.UtcNow,
                updatedAt: DateTime.UtcNow,
                isDeleted: false,
                medicineIds: new List<Guid> { Guid.NewGuid(), Guid.NewGuid() }
            );
            var petHealthBookEntity = PetHealthBookConversion.ToEntity(petHealthBookDTO);
            var successResponse = new Response(true, "PetHealthBook created successfully");
            A.CallTo(() => fakePetHealthBookService.CreateAsync(A<PSBS.HealthCareApi.Domain.PetHealthBook>._))
                .Returns(Task.FromResult(successResponse));
            var result = await controller.CreatePetHealthBooks(petHealthBookDTO);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal("PetHealthBook created successfully", response.Message);
        }


        #endregion

        #region PUT: UpdatePetHealthBooks

        [Fact]
        public async Task UpdatePetHealthBooks_ReturnsBadRequest_WhenInvalidInput()
        {
            controller.ModelState.AddModelError("error", "Invalid input");
            var petHealthBookDTO = new PetHealthBookDTO(
                healthBookId: Guid.NewGuid(),
                BookingServiceItemId: Guid.NewGuid(),
                visitDate: DateTime.UtcNow,
                nextVisitDate: null,
                performBy: "Dr. E",
                createdAt: DateTime.UtcNow,
                updatedAt: DateTime.UtcNow,
                isDeleted: false,
                medicineIds: new List<Guid> { Guid.NewGuid() }
            );

            var result = await controller.UpdatePetHealthBooks(petHealthBookDTO.healthBookId.Value, petHealthBookDTO);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<Response>(badRequestResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("Invalid input", response.Message);
        }

        [Fact]
        public async Task UpdatePetHealthBooks_ReturnsOk_WhenUpdatedSuccessfully()
        {
            var petHealthBook = new PSBS.HealthCareApi.Domain.PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(15),
                performBy = "Dr. F",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };
            A.CallTo(() => fakePetHealthBookService.GetByIdAsync(petHealthBook.healthBookId))
                .Returns(Task.FromResult(petHealthBook));

            var petHealthBookDTO = new PetHealthBookDTO(
                healthBookId: petHealthBook.healthBookId,
                BookingServiceItemId: petHealthBook.BookingServiceItemId,
                visitDate: petHealthBook.visitDate,
                nextVisitDate: petHealthBook.nextVisitDate,
                performBy: "Dr. F Updated",
                createdAt: petHealthBook.createdAt,
                updatedAt: DateTime.UtcNow,
                isDeleted: false,
                medicineIds: petHealthBook.medicineIds
            );

            var successResponse = new Response(true, "PetHealthBook updated successfully");
            A.CallTo(() => fakePetHealthBookService.UpdateAsync(A<PSBS.HealthCareApi.Domain.PetHealthBook>._))
                .Returns(Task.FromResult(successResponse));

            var result = await controller.UpdatePetHealthBooks(petHealthBook.healthBookId, petHealthBookDTO);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal("PetHealthBook updated successfully", response.Message);
        }


        #endregion

        #region DELETE: DeletePetHealthBooks

        [Fact]
        public async Task DeletePetHealthBooks_ReturnsNotFound_WhenNotFound()
        {
            Guid id = Guid.NewGuid();
            A.CallTo(() => fakePetHealthBookService.GetByIdAsync(id))
                .Returns(Task.FromResult<PSBS.HealthCareApi.Domain.PetHealthBook>(null));
            var result = await controller.DeletePetHealthBooks(id);
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = Assert.IsType<Response>(notFoundResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("PetHealthBook not found", response.Message);
        }

        [Fact]
        public async Task DeletePetHealthBooks_ReturnsOk_WhenDeletedSuccessfully()
        {
            var petHealthBook = new PSBS.HealthCareApi.Domain.PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(15),
                performBy = "Dr. G",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };
            A.CallTo(() => fakePetHealthBookService.GetByIdAsync(petHealthBook.healthBookId))
                .Returns(Task.FromResult(petHealthBook));

            var successResponse = new Response(true, "PetHealthBook deleted successfully");
            A.CallTo(() => fakePetHealthBookService.DeleteAsync(petHealthBook))
                .Returns(Task.FromResult(successResponse));

            var result = await controller.DeletePetHealthBooks(petHealthBook.healthBookId);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal("PetHealthBook deleted successfully", response.Message);
        }

        #endregion
    }
}
