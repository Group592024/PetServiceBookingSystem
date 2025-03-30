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

namespace UnitTest.PetHealthBookRepositoryTests
{
    public class PetHealthBookRepositoryTests : IDisposable
    {
        private readonly HealthCareDbContext _context;
        private readonly PetHealthBookRepository _repository;

        public PetHealthBookRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<HealthCareDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new HealthCareDbContext(options);
            _repository = new PetHealthBookRepository(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        #region CreateAsync

        [Fact]
        public async Task CreateAsync_ReturnsFailure_WhenMedicinesCollectionIsEmpty()
        {
            var petHealthBook = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(15),
                performBy = "Dr. Test",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid>() 
            };
            var response = await _repository.CreateAsync(petHealthBook);
            Assert.False(response.Flag);
            Assert.Equal("Medicines collection cannot be empty", response.Message);
        }

        [Fact]
        public async Task CreateAsync_ReturnsFailure_WhenSomeMedicinesNotFound()
        {
            var petHealthBook = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(15),
                performBy = "Dr. Test",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() }
            };
            var response = await _repository.CreateAsync(petHealthBook);
            Assert.False(response.Flag);
            Assert.Equal("Some medicines not found.", response.Message);
        }

        [Fact]
        public async Task CreateAsync_ReturnsSuccess_WhenValid()
        {
            var med1 = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine A",
                medicineImage = "a.jpg",
                isDeleted = false
            };
            var med2 = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Medicine B",
                medicineImage = "b.jpg",
                isDeleted = false
            };
            _context.Medicines.AddRange(med1, med2);
            await _context.SaveChangesAsync();

            var petHealthBook = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(15),
                performBy = "Dr. Create",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { med1.medicineId, med2.medicineId }
            };
            var response = await _repository.CreateAsync(petHealthBook);
            Assert.True(response.Flag);
            Assert.Equal("PetHealthBook with Medicines added successfully", response.Message);
        }

        #endregion

        #region DeleteAsync

        [Fact]
        public async Task DeleteAsync_ReturnsFailure_WhenNotFound()
        {
            var petHealthBook = new PetHealthBook
            {
                healthBookId = Guid.NewGuid()
            };

            var response = await _repository.DeleteAsync(petHealthBook);
            Assert.False(response.Flag);
            Assert.Contains("not found", response.Message);
        }

        [Fact]
        public async Task DeleteAsync_HardDeletes_WhenAlreadyDeleted_AndNotReferenced()
        {
            var petHealthBook = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(15),
                performBy = "Dr. Hard",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = true,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };
            _context.PetHealthBooks.Add(petHealthBook);
            await _context.SaveChangesAsync();

            _context.Entry(petHealthBook).State = EntityState.Detached;

            var response = await _repository.DeleteAsync(petHealthBook);

            Assert.True(response.Flag, "Expected hard deletion to succeed, but response flag was false.");
            Assert.Contains("permanently deleted", response.Message);

            var deleted = await _context.PetHealthBooks.FirstOrDefaultAsync(p => p.healthBookId == petHealthBook.healthBookId);
            Assert.Null(deleted);
        }

        #endregion

        #region GetAllAsync

        [Fact]
        public async Task GetAllAsync_ReturnsAllPetHealthBooks()
        {
            var phb1 = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(10),
                performBy = "Dr. A",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };
            var phb2 = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(20),
                performBy = "Dr. B",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };
            _context.PetHealthBooks.AddRange(phb1, phb2);
            await _context.SaveChangesAsync();
            var result = await _repository.GetAllAsync();
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }
        #endregion

        #region GetByAsync & GetByIdAsync

        [Fact]
        public async Task GetByAsync_ReturnsCorrectPetHealthBook_WhenPredicateMatches()
        {
            var phb = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(5),
                performBy = "Dr. Predicate",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };
            _context.PetHealthBooks.Add(phb);
            await _context.SaveChangesAsync();
            Expression<Func<PetHealthBook, bool>> predicate = p => p.performBy == "Dr. Predicate";
            var result = await _repository.GetByAsync(predicate);
            Assert.NotNull(result);
            Assert.Equal("Dr. Predicate", result.performBy);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsPetHealthBook_WhenExists()
        {
            var phb = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(7),
                performBy = "Dr. Id",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { Guid.NewGuid() }
            };
            _context.PetHealthBooks.Add(phb);
            await _context.SaveChangesAsync();
            var result = await _repository.GetByIdAsync(phb.healthBookId);
            Assert.NotNull(result);
            Assert.Equal("Dr. Id", result.performBy);
        }

        #endregion

        #region UpdateAsync
        [Fact]
        public async Task UpdateAsync_ReturnsSuccess_WhenUpdated()
        {
            var medicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Test Medicine",
                medicineImage = "test.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();
            var phb = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(10),
                performBy = "Dr. Update",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { medicine.medicineId }
            };
            _context.PetHealthBooks.Add(phb);
            await _context.SaveChangesAsync();
            _context.ChangeTracker.Clear();

            var updatedPhb = new PetHealthBook
            {
                healthBookId = phb.healthBookId,
                BookingServiceItemId = phb.BookingServiceItemId,
                visitDate = phb.visitDate,
                nextVisitDate = DateTime.UtcNow.AddDays(20),  
                performBy = "Dr. Updated",                   
                createdAt = phb.createdAt,
                updatedAt = DateTime.UtcNow,
                isDeleted = phb.isDeleted,
                medicineIds = new List<Guid> { medicine.medicineId } 
            };

            var response = await _repository.UpdateAsync(updatedPhb);
            Assert.True(response.Flag, $"Expected update to succeed, but response.Flag was false. Response message: {response.Message}");
            Assert.Contains("successfully updated", response.Message);

            var fromDb = await _context.PetHealthBooks.FirstOrDefaultAsync(p => p.healthBookId == phb.healthBookId);
            Assert.NotNull(fromDb);
            Assert.Equal("Dr. Updated", fromDb.performBy);
            Assert.Equal(updatedPhb.nextVisitDate, fromDb.nextVisitDate);
        }
        [Fact]
        public async Task UpdateAsync_ReturnsFailure_WhenSomeMedicinesNotFound()
        {
            var medicine = new Medicine
            {
                medicineId = Guid.NewGuid(),
                treatmentId = Guid.NewGuid(),
                medicineName = "Test Medicine",
                medicineImage = "test.jpg",
                isDeleted = false
            };
            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();
            var phb = new PetHealthBook
            {
                healthBookId = Guid.NewGuid(),
                BookingServiceItemId = Guid.NewGuid(),
                visitDate = DateTime.UtcNow,
                nextVisitDate = DateTime.UtcNow.AddDays(10),
                performBy = "Dr. Update",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow,
                isDeleted = false,
                medicineIds = new List<Guid> { medicine.medicineId }
            };
            _context.PetHealthBooks.Add(phb);
            await _context.SaveChangesAsync();
            _context.ChangeTracker.Clear();
            var updatedPhb = new PetHealthBook
            {
                healthBookId = phb.healthBookId,
                BookingServiceItemId = phb.BookingServiceItemId,
                visitDate = phb.visitDate,
                nextVisitDate = DateTime.UtcNow.AddDays(20),
                performBy = "Dr. Updated",
                createdAt = phb.createdAt,
                updatedAt = DateTime.UtcNow,
                isDeleted = phb.isDeleted,
                medicineIds = new List<Guid> { medicine.medicineId, Guid.NewGuid() }
            };
            var response = await _repository.UpdateAsync(updatedPhb);
            Assert.False(response.Flag);
            Assert.Equal("Some medicines not found.", response.Message);
        }



        #endregion
    }
}
