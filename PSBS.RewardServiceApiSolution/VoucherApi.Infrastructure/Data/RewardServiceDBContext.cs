

using Microsoft.EntityFrameworkCore;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Infrastructure.Data
{
    public class RewardServiceDBContext(DbContextOptions<RewardServiceDBContext> options): DbContext(options)
    {
        public DbSet<Voucher> Vouchers {  get; set; }
        public DbSet<Gift> Gifts { get; set; }
        public DbSet<RedeemGiftHistory> RedeemGiftHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RedeemGiftHistory>().HasKey(P => P.RedeemHistoryId);
            modelBuilder.Entity<RedeemGiftHistory>()
                .HasOne(p => p.Gift)
                .WithMany(c => c.RedeemGiftHistories)
                .HasForeignKey(r => r.GiftId);


        }
    }
}
