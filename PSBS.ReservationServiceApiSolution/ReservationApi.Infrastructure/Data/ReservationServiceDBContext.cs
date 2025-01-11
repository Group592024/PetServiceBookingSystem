
using Microsoft.EntityFrameworkCore;
using ReservationApi.Domain.Entities;

namespace ReservationApi.Infrastructure.Data
{
    public class ReservationServiceDBContext(DbContextOptions<ReservationServiceDBContext> options): DbContext(options)
    {
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingStatus> BookingStatuses { get; set; }
        public DbSet<PaymentType> PaymentTypes { get; set; }
        public DbSet<BookingType> BookingTypes { get; set; }
        public DbSet<PointRule> PointRules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Booking>().HasKey(P => P.BookingId);
            modelBuilder.Entity<Booking>()
                .HasOne(p => p.BookingStatus)
                .WithMany(c => c.Bookings)
                .HasForeignKey(r => r.BookingStatusId);
            modelBuilder.Entity<Booking>()
               .HasOne(p => p.BookingType)
               .WithMany(c => c.Bookings)
               .HasForeignKey(r => r.BookingTypeId);
            modelBuilder.Entity<Booking>()
               .HasOne(p => p.PointRule)
               .WithMany(c => c.Bookings)
               .HasForeignKey(r => r.PointRuleId);
            modelBuilder.Entity<Booking>()
               .HasOne(p => p.PaymentType)
               .WithMany(c => c.Bookings)
               .HasForeignKey(r => r.PaymentTypeId);


        }
    }
}
