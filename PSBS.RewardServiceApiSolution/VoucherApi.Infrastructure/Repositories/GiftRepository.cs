using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;
using VoucherApi.Application.Interfaces;
using VoucherApi.Domain.Entities;
using VoucherApi.Infrastructure.Data;

namespace VoucherApi.Infrastructure.Repositories
{
    public class GiftRepository(RewardServiceDBContext context) : IGift
    {
        public async Task<Response> CreateAsync(Gift entity)
        {
            try
            {
                var existingGift = await GetByIdAsync(entity.GiftId);
                if (existingGift != null)
                {
                    return new Response(false, $"{entity.GiftName} already exist! ");
                }
                if(entity.GiftCode != null)
                {
                    var existingGiftCode = await context.Gifts.Where(g => g.GiftCode == entity.GiftCode && !g.GiftStatus).FirstOrDefaultAsync();
                    if (existingGiftCode != null)
                    {
                        return new Response(false, $"{entity.GiftCode} already exist! ");
                    }
                }
                entity.GiftStatus = false;
                var currentGift = context.Gifts.Add(entity).Entity;
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.GiftName} is created successfully");
            }
            catch (Exception ex)
            {
                return new Response(false, "Error occured creating the gift");
            }
        }

        public async Task<Response> DeleteAsync(Gift entity)
        {
            try
            {
                if (entity == null)
                {
                    return new Response(false, "Gift can't not found");
                }
                if (!entity.GiftStatus)
                {
                    entity.GiftStatus = true;
                    context.Gifts.Update(entity);
                    context.SaveChanges();
                    return new Response(true, "Gift is inactive successfully");
                }
                var existUsingGifts = context.RedeemGiftHistories.FirstOrDefault(rgh => rgh.GiftId == entity.GiftId);
                if (existUsingGifts != null)
                {
                    return new Response(false, "The gift has an redeem history that cannot be erased.");
                }
                context.Gifts.Remove(entity);
                await context.SaveChangesAsync();
                return new Response { Flag = true, Message = "The gift is deleted successfully" };
            }
            catch (Exception ex)
            {
                return new Response(false, "Error occured removing the gift");
            }
        }

        public async Task<IEnumerable<Gift>> GetAllAsync()
        {
            try
            {
                var listGifts = await context.Gifts.ToListAsync();
                return listGifts != null ? listGifts : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving gift");
            }
        }

        public async Task<Gift> GetByAsync(Expression<Func<Gift, bool>> predicate)
        {
            try
            {
                var gift = await context.Gifts.Where(predicate).FirstOrDefaultAsync()!;
                return gift != null ? gift : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving gift");
            }
        }

        public async Task<Gift> GetByIdAsync(Guid id)
        {
            try
            {
                var gift = await context.Gifts.FirstOrDefaultAsync(g => g.GiftId == id);
                return gift != null ? gift : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving gift");
            }
        }

        public async Task<Gift> GetGiftDetailForCustomerAsync(Guid id)
        {
            try
            {
                var gift = await context.Gifts.FirstOrDefaultAsync(g => g.GiftId == id && !g.GiftStatus);
                return gift != null ? gift : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving gift");
            }
        }

        public async Task<IEnumerable<Gift>> GetGiftListForCustomerAsync()
        {
            try
            {
                var listGifts = await context.Gifts.Where(g => !g.GiftStatus).ToListAsync();
                return listGifts != null ? listGifts : null!;
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred retrieving gift");
            }
        }

        public async Task<Response> UpdateAsync(Gift entity)
        {
            try
            {
                var existingGift = await GetByIdAsync(entity.GiftId);
                if (existingGift == null)
                {
                    return new Response(false, "The gift can't not found");
                }
                if (entity.GiftCode != null)
                {
                    var existingGiftCode = await context.Gifts.Where(g => g.GiftCode == entity.GiftCode && !g.GiftStatus && g.GiftId != entity.GiftId).FirstOrDefaultAsync();
                    if (existingGiftCode != null)
                    {
                        return new Response(false, $"{entity.GiftCode} already exist! ");
                    }
                }
                 if(entity.GiftCode.IsNullOrEmpty())
                {
                    entity.GiftCode = "";
                }
                existingGift.GiftName = entity.GiftName;
                existingGift.GiftDescription = entity.GiftDescription;
                existingGift.GiftImage = entity.GiftImage;
                existingGift.GiftPoint = entity.GiftPoint;
                existingGift.GiftCode = entity.GiftCode;
                existingGift.GiftQuantity = entity.GiftQuantity;
                existingGift.GiftStatus = entity.GiftStatus;
                
                context.Entry(existingGift).State = EntityState.Modified;
                await context.SaveChangesAsync();
                return new Response(true, " The gift is updated successfully");
            }
            catch (Exception ex)
            {
                return new Response(false, "Error occured updating the gift");
            }
        }

        public async Task<Gift> GetGift(Guid id)
        {
            return await context.Gifts.FirstOrDefaultAsync(g => g.GiftId == id);
        }
    }
}
