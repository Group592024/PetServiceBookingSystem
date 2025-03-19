using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSBS.HealthCareApi.Infrastructure.Repositories;

namespace PSBS.HealthCareApi.Tests.Repositories;
public class TreatmentRepositoryTests
{
    private readonly HealthCareDbContext _context;
    private readonly TreatmentRepository _repository;

    public TreatmentRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<HealthCareDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new HealthCareDbContext(options);
        _repository = new TreatmentRepository(_context);
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnSuccess_WhenTreatmentIsValid()
    {
        // Arrange
        var treatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Physiotherapy",
            isDeleted = false
        };

        // Act
        var result = await _repository.CreateAsync(treatment);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeTrue();
        result.Message.Should().Be("Physiotherapy added successfully");

        // Verify in database
        var savedTreatment = await _context.Treatments.FindAsync(treatment.treatmentId);
        savedTreatment.Should().NotBeNull();
        savedTreatment.treatmentName.Should().Be("Physiotherapy");
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnError_WhenDuplicateTreatmentName()
    {
        // Arrange
        var treatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "DuplicateTest"
        };
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();

        var duplicateTreatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "DuplicateTest"
        };

        // Act
        var result = await _repository.CreateAsync(duplicateTreatment);

        // Assert
        result.Flag.Should().BeFalse();
        result.Message.Should().Be("Treatment with Name DuplicateTest already exists!");
    }

    //[Fact]
    //public async Task CreateAsync_ShouldReturnFailure_WhenTreatmentIsInvalid()
    //{
    //    // Arrange
    //    var invalidTreatment = new Treatment
    //    {
    //        treatmentId = Guid.Empty, 
    //        treatmentName = "", 
    //        isDeleted = false
    //    };

    //    // Act
    //    var result = await _repository.CreateAsync(invalidTreatment);

    //    // Assert
    //    result.Should().NotBeNull();
    //    result.Flag.Should().BeFalse();
    //    result.Message.Should().Be("Invalid treatment details.");
    //}

    [Fact]
    public async Task DeleteAsync_ShouldSoftDelete_WhenTreatmentExists()
    {
        // Arrange
        var treatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Acupuncture",
            isDeleted = false
        };
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteAsync(treatment);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeTrue();
        result.Message.Should().Be("Treatment and related medicines soft deleted successfully.");

        // Verify in database
        var deletedTreatment = await _context.Treatments.FindAsync(treatment.treatmentId);
        deletedTreatment.Should().NotBeNull();
        deletedTreatment.isDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_ShouldHardDelete_WhenNoRelatedMedicines()
    {
        // Arrange
        var treatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Acupuncture",
            isDeleted = true 
        };
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteAsync(treatment);

        // Assert
        result.Flag.Should().BeTrue();
        result.Message.Should().Be($"Treatment {treatment.treatmentName} has been permanently deleted.");

        var deletedTreatment = await _context.Treatments.FindAsync(treatment.treatmentId);
        deletedTreatment.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ShouldFailHardDelete_WhenTreatmentHasRelatedMedicines()
    {
        // Arrange
        var treatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Acupuncture",
            isDeleted = true
        };

        var medicine = new Medicine
        {
            medicineId = Guid.NewGuid(),
            medicineName = "Painkiller",
            medicineImage = "medicine.jpg",
            treatmentId = treatment.treatmentId 
        };

        _context.Treatments.Add(treatment);
        _context.Medicines.Add(medicine);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteAsync(treatment);

        // Assert
        result.Flag.Should().BeFalse();
        var existingTreatment = await _context.Treatments.FindAsync(treatment.treatmentId);
        existingTreatment.Should().NotBeNull(); 

        var existingMedicine = await _context.Medicines.FindAsync(medicine.medicineId);
        existingMedicine.Should().NotBeNull(); 
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnFailure_WhenTreatmentNotFound()
    {
        // Arrange
        var nonExistentTreatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Unknown Treatment"
        };

        // Act
        var result = await _repository.DeleteAsync(nonExistentTreatment);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeFalse();
        result.Message.Should().Be("Treatment with Name Unknown Treatment not found.");
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnSuccess_WhenUpdatingValidTreatment()
    {
        // Arrange
        var treatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Massage Therapy",
            isDeleted = false
        };
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();

        treatment.treatmentName = "Updated Massage Therapy";

        // Act
        var result = await _repository.UpdateAsync(treatment);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeTrue();
        result.Message.Should().Be("Treatment with Name Updated Massage Therapy updated successfully.");

        // Verify in database
        var updatedTreatment = await _context.Treatments.FindAsync(treatment.treatmentId);
        updatedTreatment.Should().NotBeNull();
        updatedTreatment.treatmentName.Should().Be("Updated Massage Therapy");
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnError_WhenNameAlreadyExists()
    {
        // Arrange
        var treatment1 = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Existing Treatment"
        };

        var treatment2 = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "New Treatment"
        };

        _context.Treatments.AddRange(treatment1, treatment2);
        await _context.SaveChangesAsync();

        var updatedTreatment = new Treatment
        {
            treatmentId = treatment2.treatmentId,
            treatmentName = "Existing Treatment" // Trùng với treatment1
        };

        // Act
        var result = await _repository.UpdateAsync(updatedTreatment);

        // Assert
        result.Flag.Should().BeFalse();
        result.Message.Should().Be("Treatment with Name Existing Treatment already exists.");
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnFailure_WhenTreatmentNotFound()
    {
        // Arrange
        var nonExistentTreatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Non-Existing Treatment"
        };

        // Act
        var result = await _repository.UpdateAsync(nonExistentTreatment);

        // Assert
        result.Should().NotBeNull();
        result.Flag.Should().BeFalse();
        result.Message.Should().Be($"Treatment with ID {nonExistentTreatment.treatmentId} not found or already deleted.");
    }

    //[Fact]
    //public async Task UpdateAsync_ShouldReturnFailure_WhenTreatmentIsInvalid()
    //{
    //    // Arrange
    //    var existingTreatment = new Treatment
    //    {
    //        treatmentId = Guid.NewGuid(),
    //        treatmentName = "Valid Treatment",
    //        isDeleted = false
    //    };
    //    _context.Treatments.Add(existingTreatment);
    //    await _context.SaveChangesAsync();

    //    var invalidTreatment = new Treatment
    //    {
    //        treatmentId = existingTreatment.treatmentId,
    //        treatmentName = "" 
    //    };

    //    // Act
    //    var result = await _repository.UpdateAsync(invalidTreatment);

    //    // Assert
    //    result.Should().NotBeNull();
    //    result.Flag.Should().BeFalse();
    //    result.Message.Should().Be("Invalid treatment details.");
    //}

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllTreatments()
    {
        // Arrange
        var treatments = new List<Treatment>
        {
            new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Treatment A" },
            new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Treatment B" }
        };
        _context.Treatments.AddRange(treatments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().NotBeNull();
        result.Count().Should().Be(2);
    }

    [Fact]
    public async Task ListAvailableTreatmentAsync_ShouldReturnOnlyNonDeletedTreatments()
    {
        // Arrange
        var treatments = new List<Treatment>
        {
            new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Active Treatment", isDeleted = false },
            new Treatment { treatmentId = Guid.NewGuid(), treatmentName = "Deleted Treatment", isDeleted = true }
        };
        _context.Treatments.AddRange(treatments);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.ListAvailableTreatmentAsync();

        // Assert
        result.Should().NotBeNull();
        result.Count().Should().Be(1);
        result.First().treatmentName.Should().Be("Active Treatment");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnTreatment_WhenExists()
    {
        // Arrange
        var treatment = new Treatment
        {
            treatmentId = Guid.NewGuid(),
            treatmentName = "Chiropractic"
        };
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(treatment.treatmentId);

        // Assert
        result.Should().NotBeNull();
        result.treatmentName.Should().Be("Chiropractic");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }
}
