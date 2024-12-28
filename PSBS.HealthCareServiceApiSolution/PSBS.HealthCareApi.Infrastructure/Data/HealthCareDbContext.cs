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
        public DbSet<Medicine> PetHealthBooks { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Treatment> Treatments { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PetHealthBook>().HasKey(phb => phb.healthBookId);
            modelBuilder.Entity<PetHealthBook>()
                .HasOne(phb => phb.Medicine)
                .WithOne(m => m.PetHealthBook)
                .HasForeignKey<PetHealthBook>(phb => phb.medicineId);

            modelBuilder.Entity<Medicine>().HasKey(m => m.medicineId);
            modelBuilder.Entity<Medicine>()
                .HasOne(m => m.Treatment)
                .WithMany(t => t.Medicines)
                .HasForeignKey(m => m.treatmentId);

            modelBuilder.Entity<Treatment>().HasKey(t => t.treatmentId);
        }
    }
}
