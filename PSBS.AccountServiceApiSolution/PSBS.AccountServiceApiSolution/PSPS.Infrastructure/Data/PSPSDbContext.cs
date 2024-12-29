using Microsoft.EntityFrameworkCore;
using PSPS.Application.DTOs;
using PSPS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.Infrastructure.Data
{
    public class PSPSDbContext(DbContextOptions<PSPSDbContext> options) : DbContext(options)
    {
        public DbSet<Account> Accounts { get; set; }
    }
}
