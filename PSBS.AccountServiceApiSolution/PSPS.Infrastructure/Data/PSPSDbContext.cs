using Microsoft.EntityFrameworkCore;
using PSPS.AccountAPI.Domain.Entities;

namespace PSPS.AccountAPI.Infrastructure.Data
{
    public class PSPSDbContext : DbContext
    {
        public PSPSDbContext(DbContextOptions<PSPSDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
    }
}
