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

        public async Task<Response> AddRedeemGiftHistory(RedeemGiftHistory redeemGiftHistory)
        {
            try
            {
                var gift = await _context.Gifts.FirstOrDefaultAsync(g => g.GiftId == redeemGiftHistory.GiftId);
                if (gift == null)
                {
                    return new Response(false, "The gift does not exist to redeem");
                }
                if (gift.GiftQuantity == 0)
                {
                    return new Response(false, "The gift is out of stock");
                }

                gift.GiftQuantity--; // Decrease gift quantity by 1
                if(gift.GiftQuantity <= 0)
                {
                    gift.GiftStatus = true;
                }
                if (gift.GiftCode != null)
                {
                    redeemGiftHistory.ReddeemStautsId = Guid.Parse("33b84495-c2a6-4b3e-98ca-f13d9c150946");
                }
                redeemGiftHistory.ReddeemStautsId = Guid.Parse("1509e4e6-e1ec-42a4-9301-05131dd498e4");
                // Add new redeem history and save changes
                _context.RedeemGiftHistories.Add(redeemGiftHistory);
                _context.Gifts.Update(gift);
                await _context.SaveChangesAsync();

                return new Response(true, "Gift redemption completed successfully");
            }
            catch (Exception ex) {

                return new Response(false, "Cannot redeem this gift, an error ocurr");
            }
            
        }


        public async Task<List<RedeemGiftHistory>> GetCustomerRedeemHistory(Guid accountId)
        {
            return await _context.RedeemGiftHistories
                .Where(h => h.AccountId == accountId)
              .Include(r => r.RedeemStatus)
              .Include(s => s.Gift)
                 .OrderByDescending(h => h.RedeemDate)
              .ToListAsync();
        }

        public async Task<List<RedeemGiftHistory>> GetAllRedeemHistories()
        {
            return await _context.RedeemGiftHistories
                 .Include(r => r.RedeemStatus)
                 .Include(s=> s.Gift)
                    .OrderByDescending(h => h.RedeemDate)
                 .ToListAsync();
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
                if(statusId == Guid.Parse("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"))
                {
                    var gift = await context.Gifts.FirstOrDefaultAsync(g => g.GiftId == redeemHistory.GiftId);
                    gift.GiftQuantity += 1;
                    _context.Gifts.Update(gift);
                }
                _context.RedeemGiftHistories.Update(redeemHistory);
               
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
    try
    {
        Response response = await UpdateRedeemStatus(redeemId, Guid.Parse("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"));
        
        if (response.Flag)
        {
            var redeemHistory = await _context.RedeemGiftHistories
                .FirstOrDefaultAsync(rh => rh.RedeemHistoryId == redeemId);

            if (redeemHistory != null)
            {
                var gift = await _context.Gifts
                    .FirstOrDefaultAsync(g => g.GiftId == redeemHistory.GiftId);

                if (gift != null)
                {
                    gift.GiftQuantity += 1; 
                    gift.GiftStatus = false;
                    _context.Gifts.Update(gift);
                    await _context.SaveChangesAsync();
                }
            }
        }

        return response;  
    }
    catch (Exception ex)
    {
        return new Response { Flag = false, Message = $"Error occurred: {ex.Message}" };
    }
}
    }
}
