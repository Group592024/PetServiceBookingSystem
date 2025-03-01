

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VoucherApi.Domain.Entities
{
    public class RedeemStatus
    {
        [Key]
        [Column("redeem_status_id")]
        public Guid ReddeemStautsId { get; set; }

        [Column("redeem_status_name")]
        public string RedeemName { get; set; } = null!;
        [JsonIgnore]
        public virtual ICollection<RedeemGiftHistory>? RedeemGiftHistories { get; set; }
    }
}
