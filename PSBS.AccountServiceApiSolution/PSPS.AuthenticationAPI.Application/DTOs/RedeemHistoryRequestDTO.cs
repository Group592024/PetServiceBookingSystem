
namespace PSPS.AccountAPI.Application.DTOs
{
    public class RedeemHistoryRequestDTO
    {
        public Guid AccountId { get; set; }
        public Guid GiftId { get; set; }
        public int RedeemPoint { get; set; }
        public DateTime RedeemDate { get; set; }
    }

}
