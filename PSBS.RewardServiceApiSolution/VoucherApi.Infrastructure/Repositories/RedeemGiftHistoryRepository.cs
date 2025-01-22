using Microsoft.EntityFrameworkCore;
using VoucherApi.Application.Interfaces;
using VoucherApi.Domain.Entities;
using VoucherApi.Infrastructure.Data;

namespace VoucherApi.Infrastructure.Repositories
{
    public class RedeemGiftHistoryRepository(RewardServiceDBContext context) : IRedeemGiftHistory
    {
        private readonly RewardServiceDBContext _context = context;

        public async Task AddRedeemGiftHistory(RedeemGiftHistory redeemGiftHistory)
        {
            var existingRecord = await _context.RedeemGiftHistories
                .Where(x =>
                    x.AccountId == redeemGiftHistory.AccountId &&
                    x.GiftId == redeemGiftHistory.GiftId &&
                    x.AccountId == redeemGiftHistory.AccountId &&
                    x.GiftId == redeemGiftHistory.GiftId &&
                    x.RedeemDate.Date == redeemGiftHistory.RedeemDate.Date &&
                    x.RedeemDate.Hour == redeemGiftHistory.RedeemDate.Hour &&
                    x.RedeemDate.Minute == redeemGiftHistory.RedeemDate.Minute &&
                    Math.Abs((x.RedeemDate.Second - redeemGiftHistory.RedeemDate.Second)) <= 15)

                .FirstOrDefaultAsync();

            if (existingRecord == null)
            {
                _context.RedeemGiftHistories.Add(redeemGiftHistory);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<RedeemGiftHistory>> GetCustomerRedeemHistory(Guid accountId)
        {
            return await _context.RedeemGiftHistories
                .Where(h => h.AccountId == accountId)
                .ToListAsync();
        }

        public async Task<List<RedeemGiftHistory>> GetAllRedeemHistories()
        {
            return await _context.RedeemGiftHistories.ToListAsync();
        }
    }
}
