using Microsoft.EntityFrameworkCore;
using PSBS.HealthCareApi.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Infrastructure.Data
{
    public class HealthCareDbContext : DbContext
    {
        public HealthCareDbContext(DbContextOptions<HealthCareDbContext> options) : base(options) { }
        public DbSet<PetHealthBook> PetHealthBooks { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Treatment> Treatments { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PetHealthBook>().HasKey(phb => phb.healthBookId);
            modelBuilder.Entity<Medicine>().HasKey(m => m.medicineId);

            modelBuilder.Entity<PetHealthBook>()
                .HasMany(phb => phb.Medicines)
                .WithMany(m => m.PetHealthBooks)
                .UsingEntity<Dictionary<string, object>>(
                    "PetHealthBookMedicine",
                    j => j.HasOne<Medicine>().WithMany().HasForeignKey("medicineId"),
                    j => j.HasOne<PetHealthBook>().WithMany().HasForeignKey("healthBookId"));

            modelBuilder.Entity<Medicine>()
                .HasOne(m => m.Treatment)
                .WithMany(t => t.Medicines)
                .HasForeignKey(m => m.treatmentId);

            modelBuilder.Entity<Treatment>().HasKey(t => t.treatmentId);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=(local); Database=PSBSHealthCare; Trusted_Connection=true; TrustServerCertificate=true");
            }
        }
    }
}
