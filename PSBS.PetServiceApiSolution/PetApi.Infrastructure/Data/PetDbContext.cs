using Microsoft.EntityFrameworkCore;
using PetApi.Domain.Entities;

namespace PetApi.Infrastructure.Data
{
    public class PetDbContext : DbContext
    {
        public PetDbContext(DbContextOptions<PetDbContext> options) : base(options) { }

        public DbSet<Pet> Pets { get; set; }
        public DbSet<PetBreed> PetBreeds { get; set; }
        public DbSet<PetDiary> PetDiarys { get; set; }
        public DbSet<PetType> PetTypes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PetBreed>()
                .HasMany(p => p.Pets)
                .WithOne(p => p.PetBreed)
                .HasForeignKey(p => p.PetBreed_ID)
                .IsRequired();

            modelBuilder.Entity<PetType>()
                .HasMany(p => p.PetBreeds)
                .WithOne(p => p.PetType)
                .HasForeignKey(p => p.PetType_ID)
                .IsRequired();

            modelBuilder.Entity<Pet>()
               .HasMany(p => p.PetDiaries)
               .WithOne(p => p.Pet)
               .HasForeignKey(p => p.Pet_ID)
               .IsRequired();
        }
    }
}
