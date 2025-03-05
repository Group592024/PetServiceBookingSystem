using PSPS.SharedLibrary.Responses;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.Interfaces
{
    public interface IRedeemGiftHistory
    {
        Task<Response> AddRedeemGiftHistory(RedeemGiftHistory redeemGiftHistory);
        Task<List<RedeemGiftHistory>> GetCustomerRedeemHistory(Guid accountId);
        Task<List<RedeemGiftHistory>> GetAllRedeemHistories();
        Task<IEnumerable<RedeemStatus>> GetRedeemStatuses();
        Task<Response> UpdateRedeemStatus(Guid redeemId, Guid statusId);
        Task<Response> CustomerCancelRedeem(Guid redeemId);

    }
}
