using FacilityServiceApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FacilityServiceApi.Infrastructure.Data
{
    public class FacilityServiceDbContext : DbContext
    {
        public FacilityServiceDbContext(DbContextOptions<FacilityServiceDbContext> options) : base(options)
        {
        }

        public DbSet<Room> Room { get; set; }
        public DbSet<RoomType> RoomType { get; set; }
        public DbSet<Camera> Camera { get; set; }
        public DbSet<Service> Service { get; set; }
        public DbSet<ServiceType> ServiceType { get; set; }
        public DbSet<ServiceVariant> ServiceVariant { get; set; }
        public DbSet<RoomHistory> RoomHistories { get; set; }
        public DbSet<BookingServiceItem> bookingServiceItems { get; set; }

        public async Task<IEnumerable<BookingServiceItem>?> GetAllAsync()
        {
            throw new NotImplementedException();
        }




        // Seed data method
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<BookingServiceItem>()
            .HasOne(p => p.ServiceVariant)
            .WithMany(c => c.BookingServiceItems)
            .HasForeignKey(r => r.ServiceVariantId);

            modelBuilder.Entity<RoomHistory>()
             .HasOne(p => p.Room)
             .WithMany(c => c.RoomHistories)
             .HasForeignKey(r => r.RoomId);

            modelBuilder.Entity<RoomHistory>()
             .HasOne(p => p.Camera)
             .WithMany(c => c.RoomHistories)
             .HasForeignKey(r => r.cameraId);

            // Seed data for RoomType
            modelBuilder.Entity<RoomType>().HasData(
                new RoomType
                {
                    roomTypeId = Guid.Parse("a6f9a846-212a-4c5a-b39f-bc0ecfef023f"),
                    name = "Small Room",
                    price = 50.00m,
                    description = "Small room for small pets",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.Parse("d34d32d7-1e8a-4a55-bef9-8725b084b1b6"),
                    name = "Medium Room",
                    price = 80.00m,
                    description = "Medium room for medium-sized pets",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.Parse("58d5fd73-6017-4b8d-b52a-053b49d8c1be"),
                    name = "Large Room",
                    price = 120.00m,
                    description = "Large room for large pets",
                    isDeleted = false
                }
            );

            modelBuilder.Entity<ServiceType>().HasData(
                new ServiceType()
                {
                    serviceTypeId = Guid.Parse("2e9e9b22-81f8-4cda-900c-5e47d0849b67"),
                    typeName = "Medical",
                    description = "Medical services like vaccinations,...",
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now,
                    isDeleted = false
                },
                new ServiceType()
                {
                    serviceTypeId = Guid.Parse("b94e2e27-fb58-4419-8c4f-69c58b752eab"),
                    typeName = "Spa",
                    description = "Spa services like grooming,...",
                    createAt = DateTime.Now,
                    updateAt = DateTime.Now,
                    isDeleted = false
                }
                );
        }
    }
}
