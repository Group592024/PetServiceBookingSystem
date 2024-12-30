
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VoucherApi.Domain.Entities
{
    public class Voucher
    {
        [Column("voucher_id")]
        public Guid VoucherId { get; set; }

        [Column("voucher_name")]
        public string VoucherName { get; set; } = null!;

        [Column("voucher_description")]
        public string? VoucherDescription { get; set; }

        [Column("voucher_quantity")]
        public int VoucherQuantity { get; set; }

        [Column("voucher_discount")]
        public int VoucherDiscount { get; set; }

        [Column("voucher_maximum")]
        public decimal VoucherMaximum { get; set; }

        [Column("voucher_minimum_spend")]
        public decimal VoucherMinimumSpend { get; set; }

        [Column("voucher_code")]
        public string VoucherCode { get; set; } = null!;

        [Column("voucher_start_date")]
        public DateTime VoucherStartDate { get; set; }

        [Column("voucher_end_date")]
        public DateTime VoucherEndDate { get; set; }
        [Column("is_gift")]
        public bool IsGift { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; }
    }
}
