using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
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
                redeemGiftHistory.ReddeemStautsId =Guid.Parse("1509e4e6-e1ec-42a4-9301-05131dd498e4");
                _context.RedeemGiftHistories.Add(redeemGiftHistory);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<RedeemGiftHistory>> GetCustomerRedeemHistory(Guid accountId)
        {
            return await _context.RedeemGiftHistories
                .Where(h => h.AccountId == accountId)
              .Include(r => r.RedeemStatus).ToListAsync();
        }

        public async Task<List<RedeemGiftHistory>> GetAllRedeemHistories()
        {
            return await _context.RedeemGiftHistories
                 .Include(r => r.RedeemStatus).ToListAsync();
        }

        public async Task<IEnumerable<RedeemStatus>> GetRedeemStatuses()
        {
            return await _context.RedeemStatuses.ToListAsync();
        }

        public async Task<Response> UpdateRedeemStatus(Guid redeemId, Guid statusId)
        {
            var redeemHistory = await _context.RedeemGiftHistories.FindAsync(redeemId);

            if (redeemHistory == null)
            {
                return new Response(false, "Redeem history not found.");
            }

            // Load the current status from the database
            await _context.Entry(redeemHistory).Reference(rh => rh.RedeemStatus).LoadAsync();

            // Define the "remaining" status IDs
            Guid[] remainingStatusIds = {
        Guid.Parse("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"), // Canceled Redeem
        Guid.Parse("33b84495-c2a6-4b3e-98ca-f13d9c150946")  // Picked up at Store
    };

            // Check if the current status ID is in the "remaining" list
            if (remainingStatusIds.Contains(redeemHistory.ReddeemStautsId))
            {
                return new Response(false, "Cannot update status for Canceled Redeem or Picked up at Store statuses.");
            }

            // Proceed with the update
            redeemHistory.ReddeemStautsId = statusId;

            try
            {
                await _context.SaveChangesAsync();
                return new Response(true, "Redeem status updated successfully.")
                {
                    Data = redeemHistory
                };
            }
            catch (Exception ex)
            {
                return new Response(false, "Failed to update redeem status: " + ex.Message);
            }
        }

        public async Task<Response> CustomerCancelRedeem(Guid redeemId)
        {
            Response response =  await UpdateRedeemStatus(redeemId, Guid.Parse("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"));
            return response;

        }
    }
}
