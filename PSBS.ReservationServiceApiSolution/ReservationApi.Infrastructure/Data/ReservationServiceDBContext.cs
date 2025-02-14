
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

            modelBuilder.Entity<BookingStatus>().HasData(
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Pending", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Processing", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Cancelled", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Confirmed", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Checked in", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Checked out", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Completed", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Refunded", isDeleted = false },
                new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Rejected", isDeleted = false }
            );

            modelBuilder.Entity<BookingType>().HasData(
                new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Service", isDeleted = false },
                new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Hotel", isDeleted = false }
            );
            modelBuilder.Entity<PaymentType>().HasData(
                new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "VNPay", isDeleted = false },
                new PaymentType { PaymentTypeId = Guid.NewGuid(), PaymentTypeName = "COD", isDeleted = false }
            );
        }
    }
}
