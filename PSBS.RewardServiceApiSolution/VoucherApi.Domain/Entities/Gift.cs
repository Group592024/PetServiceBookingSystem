

using System.ComponentModel.DataAnnotations.Schema;

namespace VoucherApi.Domain.Entities
{
    public class Gift
    {
        [Column("gift_id")]
        public Guid GiftId { get; set; }

        [Column("gift_name")]
        public string GiftName { get; set; } = null!;

        [Column("gift_description")]
        public string? GiftDescription { get; set; }

        [Column("gift_image")]
        public string? GiftImage { get; set; }

        [Column("gift_point")]
        public int GiftPoint { get; set; }

        [Column("gift_code")]
        public string? GiftCode { get; set; }

        [Column("gift_status")]
        public bool GiftStatus { get; set; }
        public virtual ICollection<RedeemGiftHistory>? RedeemGiftHistories { get; set; }
    }
}
