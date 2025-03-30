using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSBS.HealthCareApi.Infrastructure.Repositories;
using PSPS.SharedLibrary.Responses;
using Xunit;

namespace UnitTest.MedicineRepositoryTests
{
    public class MedicineRepositoryTests : IDisposable
    {
        private readonly HealthCareDbContext _context;
        private readonly MedicineRepository _repository;

        public MedicineRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<HealthCareDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new HealthCareDbContext(options);
            _repository = new MedicineRepository(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        #region CreateAsync

        [Fact]
        public async Task CreateAsync_ReturnsSuccess_WhenMedicineDoesNotExist()
        {
            var newMedicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Test Medicine",
                medicineImage = "test.jpg",
                isDeleted = false
            };
            var response = await _repository.CreateAsync(newMedicine);
            Assert.True(response.Flag);
            Assert.Equal($"{newMedicine.medicineName} is created successfully", response.Message);
        }

        [Fact]
        public async Task CreateAsync_ReturnsFailure_WhenMedicineAlreadyExists()
        {
            var medicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Duplicate Medicine",
                medicineImage = "dup.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();

            var duplicateMedicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Duplicate Medicine",
                medicineImage = "dup2.jpg",
                isDeleted = false
            };

            var response = await _repository.CreateAsync(duplicateMedicine);
            Assert.False(response.Flag);
            Assert.Contains("already exist", response.Message);
        }

        #endregion

        #region DeleteAsync

        [Fact]
        public async Task DeleteAsync_SoftDeletes_WhenMedicineIsActive()
        {
            var medicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine SoftDelete",
                medicineImage = "soft.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();
            var response = await _repository.DeleteAsync(medicine);
            Assert.True(response.Flag);
            Assert.Equal("Medicine đã được vô hiệu hóa thành công", response.Message);
            var updated = await _context.Medicines.FirstOrDefaultAsync(m => m.medicineId == medicine.medicineId);
            Assert.True(updated.isDeleted);
        }

        [Fact]
        public async Task DeleteAsync_HardDeletes_WhenMedicineIsAlreadyDeletedAndNotUsed()
        {
            var medicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine HardDelete",
                medicineImage = "hard.jpg",
                isDeleted = true
            };
            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();
            var response = await _repository.DeleteAsync(medicine);
            Assert.True(response.Flag);
            Assert.Equal("Medicine đã được xóa thành công.", response.Message);
            var deleted = await _context.Medicines.FirstOrDefaultAsync(m => m.medicineId == medicine.medicineId);
            Assert.Null(deleted);
        }

        #endregion

        #region GetAllAsync & GetAllAttributeAsync

        [Fact]
        public async Task GetAllAsync_ReturnsAllMedicines()
        {
            var med1 = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine 1",
                medicineImage = "med1.jpg",
                isDeleted = false
            };
            var med2 = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine 2",
                medicineImage = "med2.jpg",
                isDeleted = false
            };
            _context.Medicines.AddRange(med1, med2);
            await _context.SaveChangesAsync();
            var result = await _repository.GetAllAsync();
            Assert.NotNull(result);
            var list = result.ToList();
            Assert.Equal(2, list.Count);
        }

        [Fact]
        public async Task GetAllAttributeAsync_ReturnsAllMedicines()
        {
            var med = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine Attribute",
                medicineImage = "medatt.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(med);
            await _context.SaveChangesAsync();
            var result = await _repository.GetAllAttributeAsync();
            Assert.NotNull(result);
            Assert.Single(result);
        }

        #endregion

        #region GetByAsync & GetByIdAsync

        [Fact]
        public async Task GetByAsync_ReturnsMedicine_WhenPredicateMatches()
        {
            var med = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine By Predicate",
                medicineImage = "pred.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(med);
            await _context.SaveChangesAsync();

            Expression<Func<Medicine, bool>> predicate = m => m.medicineName == "Medicine By Predicate";
            var result = await _repository.GetByAsync(predicate);
            Assert.NotNull(result);
            Assert.Equal("Medicine By Predicate", result.medicineName);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsMedicine_WhenExists()
        {
            var med = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine ById",
                medicineImage = "byid.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(med);
            await _context.SaveChangesAsync();

            var result = await _repository.GetByIdAsync(med.medicineId);
            Assert.NotNull(result);
            Assert.Equal("Medicine ById", result.medicineName);
        }

        #endregion

        #region UpdateAsync

        [Fact]
        public async Task UpdateAsync_ReturnsSuccess_WhenUpdated()
        {
            var med = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine Update",
                medicineImage = "update.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(med);
            await _context.SaveChangesAsync();

            var updatedMed = new Medicine
            {
                medicineId = med.medicineId,
                treatmentId = med.treatmentId,
                medicineName = "Medicine Updated",
                medicineImage = "updated.jpg",
                isDeleted = false
            };

            var response = await _repository.UpdateAsync(updatedMed);
            Assert.True(response.Flag);
            Assert.Equal(" The medicine is updated successfully", response.Message);
            var fromDb = await _context.Medicines.FirstOrDefaultAsync(m => m.medicineId == med.medicineId);
            Assert.NotNull(fromDb);
            Assert.Equal("Medicine Updated", fromDb.medicineName);
            Assert.Equal("updated.jpg", fromDb.medicineImage);
        }

        #endregion
    }
}
