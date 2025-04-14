

using Microsoft.EntityFrameworkCore;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Infrastructure.Data
{
    public class RewardServiceDBContext(DbContextOptions<RewardServiceDBContext> options): DbContext(options)
    {
        public DbSet<Voucher> Vouchers {  get; set; }
        public DbSet<Gift> Gifts { get; set; }
        public DbSet<RedeemGiftHistory> RedeemGiftHistories { get; set; }
        public DbSet<RedeemStatus> RedeemStatuses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RedeemGiftHistory>().HasKey(P => P.RedeemHistoryId);
            modelBuilder.Entity<RedeemGiftHistory>()
                .HasOne(p => p.Gift)
                .WithMany(c => c.RedeemGiftHistories)
                .HasForeignKey(r => r.GiftId);

            modelBuilder.Entity<RedeemGiftHistory>()
                  .HasOne(p => p.RedeemStatus)
                  .WithMany(c => c.RedeemGiftHistories)
                  .HasForeignKey(r => r.ReddeemStautsId);

            // Seed RedeemStatus data
            modelBuilder.Entity<RedeemStatus>().HasData(
                new RedeemStatus { ReddeemStautsId = Guid.Parse("6a565faf-d31e-4ec7-ad20-433f34e3d7a9"), RedeemName = "Canceled Redeem" },
                new RedeemStatus { ReddeemStautsId = Guid.Parse("33b84495-c2a6-4b3e-98ca-f13d9c150946"), RedeemName = "Picked up at Store" },
                new RedeemStatus { ReddeemStautsId = Guid.Parse("1509e4e6-e1ec-42a4-9301-05131dd498e4"), RedeemName = "Just Redeemed" }
            );

        }
    }
}
