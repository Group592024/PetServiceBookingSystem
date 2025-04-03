using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSBS.HealthCareApi.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace UnitTest.HealthCareServiceApi.Controllers
{
    public class MedicineControllerTest : IDisposable
    {
        private readonly IMedicine _medicineService;
        private readonly HealthCareDbContext _context;
        private readonly MedicinesController _controller;

        public MedicineControllerTest()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<HealthCareDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new HealthCareDbContext(options);
            _medicineService = A.Fake<IMedicine>();
            _controller = new MedicinesController(_medicineService, _context);

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            var treatment = new Treatment
            {
                treatmentId = Guid.NewGuid(),
                treatmentName = "Test Treatment",
                isDeleted = false
            };
            _context.Treatments.Add(treatment);
            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetMedicinesList_ReturnsOkWithMedicines()
        {
            // Arrange
            var medicines = new List<Medicine>
            {
                new() { medicineId = Guid.NewGuid(), medicineName = "Medicine 1", isDeleted = false },
                new() { medicineId = Guid.NewGuid(), medicineName = "Medicine 2", isDeleted = false }
            };

            A.CallTo(() => _medicineService.GetAllAsync()).Returns(medicines);

            // Act
            var result = await _controller.GetMedicinesList();

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var response = (result.Result as OkObjectResult)?.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
            (response.Data as IEnumerable<MedicineDTO>).Should().HaveCount(2);
        }

        [Fact]
        public async Task GetMedicinesList_ReturnsNotFoundWhenEmpty()
        {
            // Arrange
            A.CallTo(() => _medicineService.GetAllAsync()).Returns(new List<Medicine>());

            // Act
            var result = await _controller.GetMedicinesList();

            // Assert
            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetMedicineDetailById_ReturnsOkWithDetails()
        {
            // Arrange
            var treatment = _context.Treatments.First();
            var medicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = treatment.treatmentId,
                medicineName = "Test Medicine",
                isDeleted = false
            };

            A.CallTo(() => _medicineService.GetByIdAsync(medicine.medicineId)).Returns(medicine);

            // Act
            var result = await _controller.GetMedicineDetailById(medicine.medicineId);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var response = (result.Result as OkObjectResult)?.Value as Response;
            response.Should().NotBeNull();
            var detailDto = response!.Data as MedicineDetailDTO;
            detailDto.Should().NotBeNull();
            detailDto!.treatmentName.Should().Be(treatment.treatmentName);
        }

        [Fact]
        public async Task CreateMedicine_ReturnsOkWithValidInput()
        {
            // Arrange
            var treatment = _context.Treatments.First();
            var medicineDto = new MedicineDTO(
                Guid.NewGuid(),
                treatment.treatmentId,
                "New Medicine",
                null,
                A.Fake<IFormFile>(),
                false
            );

            A.CallTo(() => _medicineService.CreateAsync(A<Medicine>._))
                .Returns(new Response(true, "Medicine created"));

            // Act
            var result = await _controller.CreateMedicine(medicineDto);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task CreateMedicine_ReturnsBadRequestWithInvalidInput()
        {
            // Arrange
            var invalidDto = new MedicineDTO(
                Guid.NewGuid(),
                Guid.Empty,
                "",
                null,
                null,
                false
            );

            _controller.ModelState.AddModelError("treatmentId", "Required");
            _controller.ModelState.AddModelError("medicineName", "Required");
            _controller.ModelState.AddModelError("imageFile", "Required");

            // Act
            var result = await _controller.CreateMedicine(invalidDto);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateMedicine_ReturnsOkWithValidInput()
        {
            // Arrange
            var treatment = _context.Treatments.First();
            var medicineId = Guid.NewGuid();
            var medicineDto = new MedicineDTO(
                medicineId,
                treatment.treatmentId,
                "Updated Medicine",
                null,
                A.Fake<IFormFile>(),
                false
            );

            var existingMedicine = new Medicine { medicineId = medicineId };

            A.CallTo(() => _medicineService.GetByIdAsync(medicineId)).Returns(existingMedicine);
            A.CallTo(() => _medicineService.UpdateAsync(A<Medicine>._))
                .Returns(new Response(true, "Updated"));

            // Act
            var result = await _controller.UpdateMedicine(medicineDto);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task DeleteMedicine_ReturnsOkWhenFound()
        {
            // Arrange
            var medicineId = Guid.NewGuid();
            var existingMedicine = new Medicine { medicineId = medicineId, isDeleted = false };

            A.CallTo(() => _medicineService.GetByIdAsync(medicineId)).Returns(existingMedicine);
            A.CallTo(() => _medicineService.DeleteAsync(existingMedicine))
                .Returns(new Response(true, "Medicine deleted successfully!"));

            // Act
            var result = await _controller.DeleteMedicine(medicineId);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task GetMedicineDTOFormById_ReturnsOkWhenFound()
        {
            // Arrange
            var medicineId = Guid.NewGuid();
            var existingMedicine = new Medicine { medicineId = medicineId };

            A.CallTo(() => _medicineService.GetByIdAsync(medicineId)).Returns(existingMedicine);

            // Act
            var result = await _controller.GetMedicineDTOFormById(medicineId);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }
    }
}