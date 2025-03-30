using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Domain.Entities;
using VoucherApi.Infrastructure.Data;
using VoucherApi.Infrastructure.Repositories;

namespace UnitTest.RewardServiceApi.Repositories
{
    public class GiftsRepositoryTest
    {
        private readonly RewardServiceDBContext _context;
        private readonly GiftRepository _giftRepository;

        public GiftsRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<RewardServiceDBContext>()
                .UseInMemoryDatabase(databaseName: "RewardService_Gifts").Options;

            _context = new RewardServiceDBContext(options);
            _giftRepository = new GiftRepository(_context);
        }

        // CREATE GIFT TESTS
        [Fact]
        public async Task CreateAsync_WhenGiftAlreadyExists_ReturnErrorResponse()
        {
            // Arrange
            var giftId = Guid.NewGuid();
            var existingGift = new Gift
            {
                GiftId = giftId,
                GiftName = "Existing Gift",
                GiftCode = "EXISTING",
                GiftStatus = false
            };

            _context.Gifts.Add(existingGift);
            await _context.SaveChangesAsync();

            // Act
            var result = await _giftRepository.CreateAsync(existingGift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"{existingGift.GiftName} already exist!");
        }

        [Fact]
        public async Task CreateAsync_WhenGiftCodeExists_ReturnErrorResponse()
        {
            // Arrange
            var existingGift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Existing Gift",
                GiftCode = "EXISTING",
                GiftStatus = false
            };

            _context.Gifts.Add(existingGift);
            await _context.SaveChangesAsync();

            var newGift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "New Gift",
                GiftCode = "EXISTING",
                GiftStatus = false
            };

            // Act
            var result = await _giftRepository.CreateAsync(newGift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be($"{newGift.GiftCode} already exist!");
        }

        [Fact]
        public async Task CreateAsync_WhenGiftIsValid_ReturnSuccessResponse()
        {
            // Arrange
            var gift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "New Gift",
                GiftCode = "NEWGIFT",
                GiftStatus = false,
                GiftPoint = 100,
                GiftQuantity = 5
            };

            // Act
            var result = await _giftRepository.CreateAsync(gift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be($"{gift.GiftName} is created successfully");
            _context.Gifts.Should().Contain(gift);
        }

        // DELETE GIFT TESTS
        [Fact]
        public async Task DeleteAsync_WhenGiftExistsAndActive_SoftDelete_ReturnSuccess()
        {
            // Arrange
            var gift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Gift to Soft Delete",
                GiftStatus = false
            };

            _context.Gifts.Add(gift);
            await _context.SaveChangesAsync();

            // Act
            var result = await _giftRepository.DeleteAsync(gift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Gift is inactive successfully");

            var updatedGift = await _context.Gifts.FindAsync(gift.GiftId);
            updatedGift.GiftStatus.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_WhenGiftExistsAndInactive_DeletePermanently_ReturnSuccess()
        {
            // Arrange
            var gift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Gift to Delete",
                GiftStatus = true
            };

            _context.Gifts.Add(gift);
            await _context.SaveChangesAsync();

            // Act
            var result = await _giftRepository.DeleteAsync(gift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("The gift is deleted successfully");

            var deletedGift = await _context.Gifts.FindAsync(gift.GiftId);
            deletedGift.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_WhenGiftDoesNotExist_ReturnError()
        {
            // Arrange
            var gift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Non-existent Gift",
                GiftStatus = false // Add status to be explicit
            };

            // Act
            var result = await _giftRepository.DeleteAsync(gift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Gift can't not found");
        }

        // GET ALL TESTS
        [Fact]
        public async Task GetAllAsync_WhenGiftsExist_ReturnListOfGifts()
        {
            // Arrange
            var gifts = new List<Gift>
            {
                new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 1", GiftStatus = false },
                new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 2", GiftStatus = true }
            };

            _context.Gifts.AddRange(gifts);
            await _context.SaveChangesAsync();

            // Act
            var result = await _giftRepository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(g => g.GiftName == "Gift 1");
            result.Should().Contain(g => g.GiftName == "Gift 2");
        }

        // GET FOR CUSTOMER TESTS
        [Fact]
        public async Task GetGiftListForCustomerAsync_ReturnsOnlyActiveGifts()
        {
            // Arrange - create fresh test data
            var activeGift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Active Gift",
                GiftStatus = false
            };

            var inactiveGift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Inactive Gift",
                GiftStatus = true
            };

            await _context.Gifts.AddRangeAsync(activeGift, inactiveGift);
            await _context.SaveChangesAsync();

            // Act
            var result = await _giftRepository.GetGiftListForCustomerAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().ContainSingle();
            result.First().GiftId.Should().Be(activeGift.GiftId);
            result.First().GiftName.Should().Be("Active Gift");
            result.First().GiftStatus.Should().BeFalse();
        }

        [Fact]
        public async Task GetGiftDetailForCustomerAsync_ReturnsOnlyActiveGift()
        {
            // Arrange
            var activeGiftId = Guid.NewGuid();
            _context.Gifts.AddRange(new List<Gift>
            {
                new Gift { GiftId = activeGiftId, GiftName = "Active Gift", GiftStatus = false },
                new Gift { GiftId = Guid.NewGuid(), GiftName = "Inactive Gift", GiftStatus = true }
            });
            await _context.SaveChangesAsync();

            // Act
            var result = await _giftRepository.GetGiftDetailForCustomerAsync(activeGiftId);

            // Assert
            result.Should().NotBeNull();
            result.GiftName.Should().Be("Active Gift");
        }

        // UPDATE TESTS
        [Fact]
        public async Task UpdateAsync_WhenGiftExists_UpdatesSuccessfully()
        {
            // Arrange
            var gift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Original Name",
                GiftCode = "ORIGINAL",
                GiftStatus = false
            };
            _context.Gifts.Add(gift);
            await _context.SaveChangesAsync();

            var updatedGift = new Gift
            {
                GiftId = gift.GiftId,
                GiftName = "Updated Name",
                GiftCode = "UPDATED",
                GiftStatus = false
            };

            // Act
            var result = await _giftRepository.UpdateAsync(updatedGift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be(" The gift is updated successfully"); // Note the space at start

            var dbGift = await _context.Gifts.FindAsync(gift.GiftId);
            dbGift.GiftName.Should().Be("Updated Name");
            dbGift.GiftCode.Should().Be("UPDATED");
        }

        [Fact]
        public async Task UpdateAsync_WhenGiftDoesNotExist_ReturnsError()
        {
            // Arrange
            var gift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Non-existent Gift"
            };

            // Act
            var result = await _giftRepository.UpdateAsync(gift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("The gift can't not found");
        }

        [Fact]
        public async Task UpdateAsync_WhenGiftCodeExists_ReturnsError()
        {
            // Arrange
            var existingGift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "Existing Gift",
                GiftCode = "EXISTING",
                GiftStatus = false
            };
            _context.Gifts.Add(existingGift);

            var newGift = new Gift
            {
                GiftId = Guid.NewGuid(),
                GiftName = "New Gift",
                GiftCode = "NEW",
                GiftStatus = false
            };
            _context.Gifts.Add(newGift);
            await _context.SaveChangesAsync();

            var updatedGift = new Gift
            {
                GiftId = newGift.GiftId,
                GiftName = "New Gift",
                GiftCode = "EXISTING",
                GiftStatus = false
            };

            // Act
            var result = await _giftRepository.UpdateAsync(updatedGift);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("EXISTING already exist!");
        }
    }
}