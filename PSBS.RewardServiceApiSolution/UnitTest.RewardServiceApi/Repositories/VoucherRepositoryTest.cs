

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using VoucherApi.Domain.Entities;
using VoucherApi.Infrastructure.Data;
using VoucherApi.Infrastructure.Repositories;

namespace UnitTest.RewardServiceApi.Repositories
{
    public class VoucherRepositoryTest
    {
        private readonly RewardServiceDBContext rewardServiceDBContext;
        private readonly VoucherRepository voucherRepository;
        public VoucherRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<RewardServiceDBContext>()
                .UseInMemoryDatabase(databaseName: "RewardService").Options;

            rewardServiceDBContext = new RewardServiceDBContext(options);
            voucherRepository = new VoucherRepository(rewardServiceDBContext);

        }


      

        // CREATE VOUCHER 

        [Fact]

        public async Task CreateAsync_WhenVoucherAlreadyExist_ReturnErrorResponse()
        {
            // Arrage 
            var voucherId = Guid.NewGuid();
            var existingVoucher = new Voucher
            {
                VoucherId = voucherId,
                VoucherCode = "ExistingVoucher",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "ExistingVoucher",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };

            rewardServiceDBContext.Vouchers.Add(existingVoucher);
            await rewardServiceDBContext.SaveChangesAsync();

            // act
            var result = await voucherRepository.CreateAsync(existingVoucher);

            // assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"{existingVoucher.VoucherName} already added");
        }
        [Fact]
        public async Task CreateAsync_WhenVoucherCodeAlreadyExist_ReturnErrorResponse()
        {
            // Arrange
            var existingVoucher = new Voucher
            {
                VoucherId = Guid.NewGuid(), // Ensure a unique ID
                VoucherCode = "ExistingCode",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "VoucherName",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };

            rewardServiceDBContext.Vouchers.Add(existingVoucher);
            await rewardServiceDBContext.SaveChangesAsync();

            var newVoucher = new Voucher()
            {
                VoucherId = Guid.NewGuid(), // Ensure a unique ID
                VoucherCode = "ExistingCode",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "NewVoucherName",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };

            // Act
            var result = await voucherRepository.CreateAsync(newVoucher);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"The Code {newVoucher.VoucherCode} already added");
        }

        [Fact]
        public async Task CreateAsync_WhenVoucherIsValid_ReturnSuccessResponse()
        {
            // Arrange
            var voucher = new Voucher
            {
                VoucherId = Guid.NewGuid(), // Ensure a unique ID
                VoucherCode = "NewVoucher",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "NewVoucher",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };

            // Act
            var result = await voucherRepository.CreateAsync(voucher);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{voucher.VoucherName} added to database successfully");
            rewardServiceDBContext.Vouchers.Should().Contain(voucher);
        }


        [Fact]
        public async Task DeleteAsync_WhenVoucherExists_SoftDelete_ReturnSuccessResponse()
        {
            // Arrange
            var voucher = new Voucher
            {
                VoucherId = Guid.NewGuid(),
                VoucherCode = "TestVoucherDeleteNe",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description Detele Nha",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "TestVoucherDeleteNha",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };
            rewardServiceDBContext.Vouchers.Add(voucher);
            await rewardServiceDBContext.SaveChangesAsync();

            // Act
            var result = await voucherRepository.DeleteAsync(voucher);
            LogExceptions.LogToConsole(result.Message);
            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{voucher.VoucherName} marked as deleted.");
            var deletedVoucher = rewardServiceDBContext.Vouchers.Find(voucher.VoucherId);
            deletedVoucher.IsDeleted.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_WhenVoucherDoesNotExist_ReturnErrorResponse()
        {
            // Arrange
            var voucher = new Voucher { VoucherId = Guid.NewGuid(), VoucherName = "NonExistentVoucher" };

            // Act
            var result = await voucherRepository.DeleteAsync(voucher);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"{voucher.VoucherName} not found");
        }

        [Fact]
        public async Task DeleteAsync_WhenVoucherIsAlreadySoftDeleted_ReturnPermanentDeleteSuccess()
        {
            //Arrange
            var voucher = new Voucher
            {
                VoucherId = Guid.NewGuid(),
                VoucherCode = "TestVoucher",
                IsDeleted = true,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "TestVoucher",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };
            rewardServiceDBContext.Vouchers.Add(voucher);
            await rewardServiceDBContext.SaveChangesAsync();

            //Act
            var result = await voucherRepository.DeleteAsync(voucher);

            //Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{voucher.VoucherName} permanently deleted.");

            var deletedVoucher = rewardServiceDBContext.Vouchers.Find(voucher.VoucherId);
            deletedVoucher.Should().BeNull();
        }

      

        // GET ALL VOUCHERS
        [Fact]
        public async Task GetAllAsync_WhenVouchersExist_ReturnListOfVouchers()
        {
            // Arrange
            rewardServiceDBContext.Vouchers.AddRange(new List<Voucher>
            {
                new Voucher { VoucherId = Guid.NewGuid(), VoucherCode = "Voucher1", IsDeleted = false, IsGift = true, VoucherName = "Voucher1" },
                new Voucher { VoucherId = Guid.NewGuid(), VoucherCode = "Voucher2", IsDeleted = false, IsGift = false, VoucherName = "Voucher2" }
            });
            await rewardServiceDBContext.SaveChangesAsync();

            // Act
            var result = await voucherRepository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
          
        }

       



        // GET ALL FOR CUSTOMER
        [Fact]
        public async Task GetAllForCustomer_WhenVouchersExist_ReturnListOfNonGiftNonDeletedVouchers()
        {
            // Arrange
            rewardServiceDBContext.Vouchers.AddRange(new List<Voucher>
            {
                new Voucher { VoucherId = Guid.NewGuid(), VoucherCode = "Voucher1", IsDeleted = false, IsGift = false, VoucherName = "Voucher1" },
                new Voucher { VoucherId = Guid.NewGuid(), VoucherCode = "Voucher2", IsDeleted = false, IsGift = true, VoucherName = "Voucher2" },
                new Voucher { VoucherId = Guid.NewGuid(), VoucherCode = "Voucher3", IsDeleted = true, IsGift = false, VoucherName = "Voucher3" },
                new Voucher { VoucherId = Guid.NewGuid(), VoucherCode = "Voucher4", IsDeleted = false, IsGift = false, VoucherName = "Voucher4" }
            });
            await rewardServiceDBContext.SaveChangesAsync();

            // Act
            var result = await voucherRepository.GetAllForCustomer();

            // Assert
            result.Should().NotBeNull();         
          
        }

      
        // MINUS VOUCHER QUANTITY
        [Fact]
        public async Task MinusVoucherQuantity_WhenVoucherExists_DecreaseQuantity_ReturnSuccess()
        {
            // Arrange
            var voucher = new Voucher
            {
                VoucherId = Guid.NewGuid(),
                VoucherCode = "TestVoucher",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "TestVoucher",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };
            rewardServiceDBContext.Vouchers.Add(voucher);
            await rewardServiceDBContext.SaveChangesAsync();

            // Act
            var result = await voucherRepository.MinusVoucherQuanitty(voucher.VoucherId);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Voucher quantity updated successfully.");
            var updatedVoucher = rewardServiceDBContext.Vouchers.Find(voucher.VoucherId);
            updatedVoucher.VoucherQuantity.Should().Be(4);
        }

        [Fact]
        public async Task MinusVoucherQuantity_WhenVoucherDoesNotExist_ReturnError()
        {
            // Arrange
            var voucherId = Guid.NewGuid();

            // Act
            var result = await voucherRepository.MinusVoucherQuanitty(voucherId);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Voucher does not exist.");
        }

        [Fact]
        public async Task MinusVoucherQuantity_WhenQuantityIsZero_MarkAsDeleted()
        {
            // Arrange
            var voucher = new Voucher
            {
                VoucherId = Guid.NewGuid(),
                VoucherCode = "TestVoucher",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 1, // Set quantity to 1
                VoucherDiscount = 10,
                VoucherName = "TestVoucher",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };
            rewardServiceDBContext.Vouchers.Add(voucher);
            await rewardServiceDBContext.SaveChangesAsync();

            // Act
            var result = await voucherRepository.MinusVoucherQuanitty(voucher.VoucherId);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Voucher quantity updated successfully.");
            var updatedVoucher = rewardServiceDBContext.Vouchers.Find(voucher.VoucherId);
            updatedVoucher.IsDeleted.Should().BeTrue();
            updatedVoucher.VoucherQuantity.Should().Be(0);
        }

        // UPDATE VOUCHER
        [Fact]
        public async Task UpdateAsync_WhenVoucherExists_UpdateVoucher_ReturnSuccess()
        {
            // Arrange
            var voucher = new Voucher
            {
                VoucherId = Guid.NewGuid(),
                VoucherCode = "OriginalCode",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Original Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "OriginalName",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };
            rewardServiceDBContext.Vouchers.Add(voucher);
            await rewardServiceDBContext.SaveChangesAsync();

            var updatedVoucher = new Voucher
            {
                VoucherId = voucher.VoucherId,
                VoucherCode = "UpdatedCode",
                IsDeleted = false,
                IsGift = false,
                VoucherDescription = "Updated Description",
                VoucherQuantity = 10,
                VoucherDiscount = 20,
                VoucherName = "UpdatedName",
                VoucherStartDate = DateTime.Now.AddDays(1),
                VoucherEndDate = DateTime.Now.AddDays(14),
                VoucherMaximum = 200,
                VoucherMinimumSpend = 100
            };

            // Act
            var result = await voucherRepository.UpdateAsync(updatedVoucher);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{updatedVoucher.VoucherName} successfully updated");
            var retrievedVoucher = rewardServiceDBContext.Vouchers.Find(voucher.VoucherId);
            retrievedVoucher.Should().BeEquivalentTo(updatedVoucher);
        }

        [Fact]
        public async Task UpdateAsync_WhenVoucherDoesNotExist_ReturnError()
        {
            // Arrange
            var updatedVoucher = new Voucher
            {
                VoucherId = Guid.NewGuid(),
                VoucherCode = "UpdatedCode",
                IsDeleted = false,
                IsGift = false,
                VoucherDescription = "Updated Description",
                VoucherQuantity = 10,
                VoucherDiscount = 20,
                VoucherName = "UpdatedName",
                VoucherStartDate = DateTime.Now.AddDays(1),
                VoucherEndDate = DateTime.Now.AddDays(14),
                VoucherMaximum = 200,
                VoucherMinimumSpend = 100
            };

            // Act
            var result = await voucherRepository.UpdateAsync(updatedVoucher);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"{updatedVoucher.VoucherName} not found");
        }

        [Fact]
        public async Task UpdateAsync_WhenNewNameExists_ReturnError()
        {
            //Arrange
            var firstVoucher = new Voucher() { VoucherId = Guid.NewGuid(), VoucherName = "First", VoucherCode = "Code12"  ,IsDeleted = true, IsGift = false };
            var secondVoucher = new Voucher() { VoucherId = Guid.NewGuid(), VoucherName = "Second", VoucherCode = "Code23", IsDeleted = true, IsGift = false };
            rewardServiceDBContext.Vouchers.AddRange(firstVoucher, secondVoucher);
            await rewardServiceDBContext.SaveChangesAsync();

            var testVoucher = new Voucher() { VoucherId = secondVoucher.VoucherId, VoucherName = "First", VoucherCode = "Code23", IsDeleted = true, IsGift = false };
            //Act
            var result = await voucherRepository.UpdateAsync(testVoucher);

            //Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Voucher name '{testVoucher.VoucherName}' is already in use.");
        }

        [Fact]
        public async Task UpdateAsync_WhenNewCodeExists_ReturnError()
        {
            //Arrange
            var firstVoucher = new Voucher() { VoucherId = Guid.NewGuid(), VoucherName = "Name12", VoucherCode = "Code1", IsDeleted = true, IsGift = false };
            var secondVoucher = new Voucher() { VoucherId = Guid.NewGuid(), VoucherName = "Name2", VoucherCode = "Code2", IsDeleted = true, IsGift = false };
            rewardServiceDBContext.Vouchers.AddRange(firstVoucher, secondVoucher);
            await rewardServiceDBContext.SaveChangesAsync();

            var testVoucher = new Voucher() { VoucherId = secondVoucher.VoucherId, VoucherName = "Name22", VoucherCode = "Code1", IsDeleted = true, IsGift = false };
         
            //Act
            var result = await voucherRepository.UpdateAsync(testVoucher);

            //Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"Voucher code '{testVoucher.VoucherCode}' is already in use.");
        }


    }
}
