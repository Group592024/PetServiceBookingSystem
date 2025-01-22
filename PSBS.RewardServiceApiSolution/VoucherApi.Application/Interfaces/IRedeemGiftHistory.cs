using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.Interfaces
{
    public interface IRedeemGiftHistory
    {
        Task AddRedeemGiftHistory(RedeemGiftHistory redeemGiftHistory);
        Task<List<RedeemGiftHistory>> GetCustomerRedeemHistory(Guid accountId);
        Task<List<RedeemGiftHistory>> GetAllRedeemHistories();
    }
}
