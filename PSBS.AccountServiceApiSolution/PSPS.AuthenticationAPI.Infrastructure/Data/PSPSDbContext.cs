using Microsoft.EntityFrameworkCore;
using PSPS.AccountAPI.Domain.Entities;

namespace PSPS.AccountAPI.Infrastructure.Data
{
    public class PSPSDbContext : DbContext
    {
        public PSPSDbContext(DbContextOptions<PSPSDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed data for Role
            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = "admin", RoleName = "Admin" },
                new Role { RoleId = "user", RoleName = "User" },
                new Role { RoleId = "staff", RoleName = "Staff" }
            );
        }
    }
}
