
using System.ComponentModel.DataAnnotations.Schema;

namespace VoucherApi.Domain.Entities
{
    public  class RedeemGiftHistory
    {
        [Column("redeemhistory_id")]
        public Guid RedeemHistoryId { get; set; }

        [Column("gift_id")]
        public Guid GiftId { get; set; } 

        [Column("account_id")]
        public Guid AccountId { get; set; }

        [Column("redeem_point")]
        public int RedeemPoint { get; set; }

        [Column("redeem_date")]
        public DateTime RedeemDate { get; set; }
        public virtual Gift Gift { get; set; } = null!;
    }
}
