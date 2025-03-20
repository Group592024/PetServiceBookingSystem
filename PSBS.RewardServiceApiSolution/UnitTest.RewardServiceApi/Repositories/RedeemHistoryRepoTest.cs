using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VoucherApi.Domain.Entities;
using VoucherApi.Infrastructure.Data;
using VoucherApi.Infrastructure.Repositories;
using Xunit;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace UnitTest.RewardServiceApi.Repositories
{
    public class RedeemHistoryRepoTest
    {
        private readonly RewardServiceDBContext rewardServiceDBContext;
        private readonly RedeemGiftHistoryRepository redeemGiftHistoryRepository;

        public RedeemHistoryRepoTest()
        {
            var options = new DbContextOptionsBuilder<RewardServiceDBContext>()
                .UseInMemoryDatabase(databaseName: "RedeemGiftHistories").Options;

            rewardServiceDBContext = new RewardServiceDBContext(options);
            redeemGiftHistoryRepository = new RedeemGiftHistoryRepository(rewardServiceDBContext);

             if (!rewardServiceDBContext.RedeemStatuses.Any())
    {
        SeedData();
    }
        }

        private void SeedData()
        {
            var redeemStatus1 = new RedeemStatus { ReddeemStautsId = Guid.Parse("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"), RedeemName = "Canceled Redeem" };
            var redeemStatus2 = new RedeemStatus { ReddeemStautsId = Guid.Parse("33b84495-c2a6-4b3e-98ca-f13d9c150946"), RedeemName = "Picked up at Store" };
            var redeemStatus3 = new RedeemStatus { ReddeemStautsId = Guid.Parse("1509e4e6-e1ec-42a4-9301-05131dd498e4"), RedeemName = "Redeemed" };

            var gift1 = new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 1", GiftQuantity = 10 };
            var gift2 = new Gift { GiftId = Guid.NewGuid(), GiftName = "Gift 2", GiftQuantity = 5 };

            rewardServiceDBContext.RedeemStatuses.AddRange(redeemStatus1, redeemStatus2, redeemStatus3);
            rewardServiceDBContext.Gifts.AddRange(gift1, gift2);
            rewardServiceDBContext.SaveChanges();

            var redeemHistory1 = new RedeemGiftHistory
            {
                RedeemHistoryId = Guid.NewGuid(),
                GiftId = gift1.GiftId,
                ReddeemStautsId = redeemStatus3.ReddeemStautsId,
                AccountId = Guid.Parse("33b84495-c2a6-4b3e-98ca-f13d9c150946"),
                RedeemPoint = 100,
                RedeemDate = DateTime.Now.AddDays(-1)
            };
            var redeemHistory2 = new RedeemGiftHistory
            {
                RedeemHistoryId = Guid.Parse("33b84495-c2a6-4b3e-98ca-f13d9c150946"),
                GiftId = gift2.GiftId,
                ReddeemStautsId = redeemStatus3.ReddeemStautsId,
                AccountId = Guid.NewGuid(),
                RedeemPoint = 150,
                RedeemDate = DateTime.Now
            };

            rewardServiceDBContext.RedeemGiftHistories.AddRange(redeemHistory1, redeemHistory2);
            rewardServiceDBContext.SaveChanges();
        }

        [Fact]
        public async Task GetAllRedeemHistories_ReturnsAllHistories()
        {
            var histories = await redeemGiftHistoryRepository.GetAllRedeemHistories();

            histories.Should().NotBeNull();
            histories.Count.Should().Be(2);
            histories.Should().BeInDescendingOrder(h => h.RedeemDate);
            histories.Should().AllBeOfType<RedeemGiftHistory>();
        }

        [Fact]
        public async Task GetCustomerRedeemHistory_ReturnsCustomerHistories()
        {
            var accountId = rewardServiceDBContext.RedeemGiftHistories.First().AccountId;

            var histories = await redeemGiftHistoryRepository.GetCustomerRedeemHistory(accountId);

            histories.Should().NotBeNull();
            histories.Count.Should().Be(1);
            histories.First().AccountId.Should().Be(accountId);
            histories.Should().BeInDescendingOrder(h => h.RedeemDate);
            histories.Should().AllBeOfType<RedeemGiftHistory>();
        }

        [Fact]
        public async Task AddRedeemGiftHistory_AddsNewHistory()
        {
            var gift = rewardServiceDBContext.Gifts.First();
            var accountId = Guid.NewGuid();
            var redeemGiftHistory = new RedeemGiftHistory
            {
                RedeemHistoryId = Guid.NewGuid(),
                GiftId = gift.GiftId,
                AccountId = accountId,
                RedeemPoint = 50,
                RedeemDate = DateTime.Now
            };

            var response = await redeemGiftHistoryRepository.AddRedeemGiftHistory(redeemGiftHistory);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Gift redemption completed successfully");
            var addedHistory = await rewardServiceDBContext.RedeemGiftHistories.FindAsync(redeemGiftHistory.RedeemHistoryId);
            addedHistory.Should().NotBeNull();
           
            addedHistory.ReddeemStautsId.Should().Be(Guid.Parse("1509e4e6-e1ec-42a4-9301-05131dd498e4"));
        }

  
        [Fact]
        public async Task UpdateRedeemStatus_UpdatesStatus()
        {
            var redeemHistory = rewardServiceDBContext.RedeemGiftHistories.First(h => h.RedeemStatus.RedeemName == "Redeemed");
            var newStatusId = rewardServiceDBContext.RedeemStatuses.First(s => s.RedeemName == "Canceled Redeem").ReddeemStautsId;

            var response = await redeemGiftHistoryRepository.UpdateRedeemStatus(redeemHistory.RedeemHistoryId, newStatusId);

            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Redeem status updated successfully.");
            var updatedHistory = await rewardServiceDBContext.RedeemGiftHistories.FindAsync(redeemHistory.RedeemHistoryId);
            updatedHistory.ReddeemStautsId.Should().Be(newStatusId);
        }

        [Fact]
        public async Task CustomerCancelRedeem_CancelsRedeem()
        {
            var redeemHistory = rewardServiceDBContext.RedeemGiftHistories.First(h => h.RedeemStatus.RedeemName == "Redeemed");
            var cancelStatusId = Guid.Parse("6a565faf-d31e-4ec7-ad20-433f34e3d7a9");

            var response = await redeemGiftHistoryRepository.CustomerCancelRedeem(redeemHistory.RedeemHistoryId);

            response.Flag.Should().BeTrue();
            var cancelledHistory = await rewardServiceDBContext.RedeemGiftHistories.FindAsync(redeemHistory.RedeemHistoryId);
            cancelledHistory.ReddeemStautsId.Should().Be(cancelStatusId);
         
        }
    }
}