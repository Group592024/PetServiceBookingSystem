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


        // Seed data method
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed data for RoomType
            modelBuilder.Entity<RoomType>().HasData(
                new RoomType
                {
                    roomTypeId = Guid.Parse("a6f9a846-212a-4c5a-b39f-bc0ecfef023f"),
                    name = "Small Room",
                    pricePerHour = 50.00m,
                    pricePerDay = 400.00m,
                    description = "Small room for small pets",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.Parse("d34d32d7-1e8a-4a55-bef9-8725b084b1b6"),
                    name = "Medium Room",
                    pricePerHour = 80.00m,
                    pricePerDay = 600.00m,
                    description = "Medium room for medium-sized pets",
                    isDeleted = false
                },
                new RoomType
                {
                    roomTypeId = Guid.Parse("58d5fd73-6017-4b8d-b52a-053b49d8c1be"),
                    name = "Large Room",
                    pricePerHour = 120.00m,
                    pricePerDay = 1000.00m,
                    description = "Large room for large pets",
                    isDeleted = false
                }
            );
        }
    }
}
