//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using FakeItEasy;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using PSBS.HealthCareApi.Application.DTOs.Conversions;
//using PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs;
//using PSBS.HealthCareApi.Application.Interfaces;
//using PSBS.HealthCareApi.Domain;
//using PSBS.HealthCareApi.Infrastructure.Data;
//using PSBS.HealthCareApi.Presentation.Controllers;
//using PSPS.SharedLibrary.Responses;
//using Xunit;

//namespace UnitTest.MedicinesControllerTests
//{
//    public class MedicinesControllerTests : IDisposable
//    {
//        private readonly IMedicine fakeMedicineService;
//        private readonly HealthCareDbContext dbContext;
//        private readonly MedicinesController controller;

//        public MedicinesControllerTests()
//        {
//            fakeMedicineService = A.Fake<IMedicine>();

//            var options = new DbContextOptionsBuilder<HealthCareDbContext>()
//                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
//                .Options;
//            dbContext = new HealthCareDbContext(options);

//            controller = new MedicinesController(fakeMedicineService, dbContext);

//            dbContext.Treatments.Add(new PSBS.HealthCareApi.Domain.Treatment
//            {
//                treatmentId = Guid.NewGuid(),
//                treatmentName = "Treatment A",
//                isDeleted = false
//            });
//            dbContext.SaveChanges();
//        }

//        public void Dispose()
//        {
//            dbContext.Database.EnsureDeleted();
//            dbContext.Dispose();
//            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImageMedicines");
//            if (Directory.Exists(folderPath))
//            {
//                Directory.Delete(folderPath, true);
//            }
//        }

//        #region GET Endpoints

//        [Fact]
//        public async Task GetMedicinesList_ReturnsNotFound_WhenNoMedicines()
//        {
//            var medicines = new List<Medicine>();

//            A.CallTo(() => fakeMedicineService.GetAllAsync())
//                .Returns(Task.FromResult((IEnumerable<Medicine>)medicines));

//            var result = await controller.GetMedicinesList();
//            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(notFoundResult.Value);
//            Assert.False(response.Flag);
//            Assert.Equal("No medicines detected", response.Message);
//        }

//        [Fact]
//        public async Task GetMedicinesList_ReturnsOk_WithData()
//        {
//            var medicines = new List<PSBS.HealthCareApi.Domain.Medicine>
//    {
//        new PSBS.HealthCareApi.Domain.Medicine
//        {
//            medicineId = Guid.NewGuid(),
//            treatmentId = Guid.NewGuid(),
//            medicineName = "Medicine 1",
//            medicineImage = "medicine1.jpg",
//            isDeleted = false
//        }
//    };

//            A.CallTo(() => fakeMedicineService.GetAllAsync())
//                .Returns(Task.FromResult((IEnumerable<PSBS.HealthCareApi.Domain.Medicine>)medicines));
//            var result = await controller.GetMedicinesList();
//            var okResult = Assert.IsType<OkObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(okResult.Value);
//            Assert.True(response.Flag);
//            Assert.Equal("Medicines retrieved successfully!", response.Message);

//            var list = response.Data as List<MedicineDTO>;
//            Assert.NotNull(list);
//            Assert.Single(list);
//        }


//        [Fact]
//        public async Task GetMedicineDetailById_ReturnsNotFound_WhenMedicineDoesNotExist()
//        {
//            Guid id = Guid.NewGuid();
//            A.CallTo(() => fakeMedicineService.GetByIdAsync(id))
//                .Returns(Task.FromResult<PSBS.HealthCareApi.Domain.Medicine>(null));
//            var result = await controller.GetMedicineDetailById(id);
//            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(notFoundResult.Value);
//            Assert.False(response.Flag);
//            Assert.Equal("The medicine requested not found", response.Message);
//        }

//        [Fact]
//        public async Task GetMedicineDetailById_ReturnsOk_WithData()
//        {
//            var medicineId = Guid.NewGuid();
//            var treatmentId = Guid.NewGuid();
//            var medicineEntity = new PSBS.HealthCareApi.Domain.Medicine
//            {
//                medicineId = medicineId,
//                treatmentId = treatmentId,
//                medicineName = "Medicine Detail",
//                medicineImage = "detail.jpg",
//                isDeleted = false
//            };
//            A.CallTo(() => fakeMedicineService.GetByIdAsync(medicineId))
//                .Returns(Task.FromResult(medicineEntity));

//            var treatment = new PSBS.HealthCareApi.Domain.Treatment
//            {
//                treatmentId = treatmentId,
//                treatmentName = "Treatment Detail",
//                isDeleted = false
//            };
//            dbContext.Treatments.Add(treatment);
//            await dbContext.SaveChangesAsync();

//            var result = await controller.GetMedicineDetailById(medicineId);
//            var okResult = Assert.IsType<OkObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(okResult.Value);
//            Assert.True(response.Flag);
//            Assert.Equal("The medicine retrieved successfully", response.Message);
//            var detailDTO = response.Data as PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs.MedicineDetailDTO;
//            Assert.NotNull(detailDTO);
//            Assert.Equal("Medicine Detail", detailDTO.medicineName);
//            Assert.Equal("Treatment Detail", detailDTO.treatmentName);
//        }

//        [Fact]
//        public async Task GetMedicineDTOFormById_ReturnsNotFound_WhenMedicineDoesNotExist()
//        {
//            Guid id = Guid.NewGuid();
//            A.CallTo(() => fakeMedicineService.GetByIdAsync(id))
//                .Returns(Task.FromResult<PSBS.HealthCareApi.Domain.Medicine>(null));
//            var result = await controller.GetMedicineDTOFormById(id);
//            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(notFoundResult.Value);
//            Assert.False(response.Flag);
//            Assert.Equal("The medicine requested not found", response.Message);
//        }

//        [Fact]
//        public async Task GetMedicineDTOFormById_ReturnsOk_WithData()
//        {
//            var medicineId = Guid.NewGuid();
//            var medicineEntity = new PSBS.HealthCareApi.Domain.Medicine
//            {
//                medicineId = medicineId,
//                treatmentId = Guid.NewGuid(),
//                medicineName = "Medicine DTO",
//                medicineImage = "dto.jpg",
//                isDeleted = false
//            };
//            A.CallTo(() => fakeMedicineService.GetByIdAsync(medicineId))
//                .Returns(Task.FromResult(medicineEntity));

//            var result = await controller.GetMedicineDTOFormById(medicineId);
//            var okResult = Assert.IsType<OkObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(okResult.Value);
//            Assert.True(response.Flag);
//            Assert.Equal("The medicine retrieved successfully", response.Message);

//            var dto = response.Data as MedicineDTO;
//            Assert.NotNull(dto);
//            Assert.Equal("Medicine DTO", dto.medicineName);
//        }


//        #endregion

//        #region POST CreateMedicine

//        [Fact]
//        public async Task CreateMedicine_ReturnsBadRequest_WhenModelStateInvalid()
//        {
//            var medicineDTO = new MedicineDTO(
//                medicineId: Guid.NewGuid(),
//                treatmentId: Guid.NewGuid(),
//                medicineName: "Test Medicine",
//                medicineImage: null,
//                imageFile: null
//            );
//            controller.ModelState.AddModelError("imageFile", "Please upload an image for medicine");
//            var result = await controller.CreateMedicine(medicineDTO);
//            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(badRequestResult.Value);
//            Assert.False(response.Flag);
//            Assert.Equal("Fail input", response.Message);
//        }

//        [Fact]
//        public async Task CreateMedicine_ReturnsOk_WhenModelValid()
//        {
//            var fileContent = "Fake image content";
//            var stream = new MemoryStream(Encoding.UTF8.GetBytes(fileContent));
//            var formFile = new FormFile(stream, 0, stream.Length, "imageFile", "test.jpg");

//            var medicineDTO = new MedicineDTO(
//                medicineId: Guid.NewGuid(),
//                treatmentId: Guid.NewGuid(),
//                medicineName: "Test Medicine",
//                medicineImage: null,
//                imageFile: formFile
//            );

//            var successResponse = new Response(true, "Medicine created successfully");
//            A.CallTo(() => fakeMedicineService.CreateAsync(A<PSBS.HealthCareApi.Domain.Medicine>._))
//                .Returns(Task.FromResult(successResponse));
//            var result = await controller.CreateMedicine(medicineDTO);
//            var okResult = Assert.IsType<OkObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(okResult.Value);
//            Assert.True(response.Flag);
//            Assert.Equal("Medicine created successfully", response.Message);

//            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImageMedicines");
//            if (Directory.Exists(folderPath))
//            {
//                Directory.Delete(folderPath, true);
//            }
//        }

//        #endregion

//        #region PUT UpdateMedicine

//        [Fact]
//        public async Task UpdateMedicine_ReturnsNotFound_WhenMedicineDoesNotExist()
//        {
//            var medicineDTO = new MedicineDTO(
//                medicineId: Guid.NewGuid(),
//                treatmentId: Guid.NewGuid(),
//                medicineName: "Nonexistent Medicine",
//                medicineImage: null,
//                imageFile: null
//            );

//            A.CallTo(() => fakeMedicineService.GetByIdAsync(medicineDTO.medicineId))
//                .Returns(Task.FromResult<PSBS.HealthCareApi.Domain.Medicine>(null));
//            var result = await controller.UpdateMedicine(medicineDTO);
//            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(notFoundResult.Value);
//            Assert.False(response.Flag);
//            Assert.Equal("The medicine is not found!", response.Message);
//        }

//        [Fact]
//        public async Task UpdateMedicine_ReturnsOk_WhenUpdatedSuccessfully()
//        {
//            var existingMedicine = new PSBS.HealthCareApi.Domain.Medicine
//            {
//                medicineId = Guid.NewGuid(),
//                treatmentId = Guid.NewGuid(),
//                medicineName = "Old Medicine",
//                medicineImage = "/ImageMedicines/old.jpg",
//                isDeleted = false
//            };
//            dbContext.Medicines.Add(existingMedicine);
//            await dbContext.SaveChangesAsync();

//            var fileContent = "New image content";
//            var stream = new MemoryStream(Encoding.UTF8.GetBytes(fileContent));
//            var formFile = new FormFile(stream, 0, stream.Length, "imageFile", "new.jpg");

//            var medicineDTO = new MedicineDTO(
//                medicineId: existingMedicine.medicineId,
//                treatmentId: existingMedicine.treatmentId,
//                medicineName: "Updated Medicine",
//                medicineImage: null,
//                imageFile: formFile
//            );

//            A.CallTo(() => fakeMedicineService.GetByIdAsync(existingMedicine.medicineId))
//                .Returns(Task.FromResult(existingMedicine));

//            var successResponse = new Response(true, "Medicine updated successfully");
//            A.CallTo(() => fakeMedicineService.UpdateAsync(A<PSBS.HealthCareApi.Domain.Medicine>._))
//                .Returns(Task.FromResult(successResponse));

//            var result = await controller.UpdateMedicine(medicineDTO);
//            var okResult = Assert.IsType<OkObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(okResult.Value);
//            Assert.True(response.Flag);
//            Assert.Equal("Medicine updated successfully", response.Message);

//            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImageMedicines");
//            if (Directory.Exists(folderPath))
//            {
//                Directory.Delete(folderPath, true);
//            }
//        }

//        #endregion

//        #region DELETE DeleteMedicine

//        [Fact]
//        public async Task DeleteMedicine_ReturnsNotFound_WhenMedicineDoesNotExist()
//        {
//            Guid id = Guid.NewGuid();
//            A.CallTo(() => fakeMedicineService.GetByIdAsync(id))
//                .Returns(Task.FromResult<PSBS.HealthCareApi.Domain.Medicine>(null));
//            var result = await controller.DeleteMedicine(id);
//            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
//            var response = Assert.IsType<Response>(notFoundResult.Value);
//            Assert.False(response.Flag);
//            Assert.Equal("The medicine is not found!", response.Message);
//        }
//        #endregion
//    }
//}
