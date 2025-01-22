
using System.ComponentModel.DataAnnotations.Schema;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.DTOs
{
    public record RedeemGiftHistoryDTO
    {
        public Guid RedeemHistoryId { get; set; }

        public Guid GiftId { get; set; }

        public Guid AccountId { get; set; }

        public int RedeemPoint { get; set; }

        public DateTime RedeemDate { get; set; }
    }
}
