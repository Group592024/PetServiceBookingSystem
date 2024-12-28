

using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;
using VoucherApi.Application.Interfaces;
using VoucherApi.Domain.Entities;
using VoucherApi.Infrastructure.Data;

namespace VoucherApi.Infrastructure.Repositories
{
    public class VoucherRepository(RewardServiceDBContext context) : IVoucher
    {
        public async Task<Response> CreateAsync(Voucher entity)
        {
            try
            {
                var getVoucher = await GetByAsync(p => p.VoucherName!.Equals(entity.VoucherName) && !p.IsDeleted);
                if (getVoucher is not null && !string.IsNullOrEmpty(getVoucher.VoucherName))
                    return new Response(false, $"{entity.VoucherName} already added");

                var getVoucherCode = await GetByAsync(p => p.VoucherCode!.Equals(entity.VoucherCode) && !p.IsDeleted);
                if (getVoucherCode is not null && !string.IsNullOrEmpty(getVoucherCode.VoucherName))
                    return new Response(false, $"The Code {entity.VoucherCode} already added");

                var currentEntity = context.Vouchers.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.VoucherId.ToString().Length > 0)
                {
                    return new Response(true, $"{entity.VoucherName} added to database successfully");
                }
                else
                {
                    return new Response(false, $"{entity.VoucherName} cannot be added due to errors");
                }
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured adding new voucher");
            }
        }

        public async Task<Response> DeleteAsync(Voucher entity)
        {
            try
            {

                var voucher = await GetByIdAsync(entity.VoucherId);
                if (voucher is null)
                {
                    return new Response(false, $"{entity.VoucherName} not found");
                }
                entity.IsDeleted = true;
                context.Entry(voucher).State = EntityState.Detached;
                context.Vouchers.Update(entity);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.VoucherName} successfully deleted");
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occurred updating existing voucher");
            }
        }

        public async Task<IEnumerable<Voucher>> GetAllAsync()
        {
            try
            {
                var vouchers = await context.Vouchers
                    .AsNoTracking()
                    .Where(v => !v.IsDeleted) // Filter where isDeleted is false
                    .ToListAsync();
                return vouchers;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while retrieving vouchers.");
            }
        }


        public async Task<Voucher> GetByAsync(Expression<Func<Voucher, bool>> predicate)
        {
            try
            {
                var voucher = await context.Vouchers.Where(predicate).FirstOrDefaultAsync()!;
                return voucher is not null ? voucher : null!;
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                throw new Exception("Error occurred retrieving voucher");
            }
        }

        public async Task<Voucher> GetByIdAsync(Guid id)
        {
            try
            {
                var voucher = await context.Vouchers
                    .AsNoTracking()
                    .SingleOrDefaultAsync(v => v.VoucherId == id && !v.IsDeleted); // Filter by ID and isDeleted
                return voucher!;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred retrieving voucher.");
            }
        }


        public async Task<Response> UpdateAsync(Voucher entity)
        {
            try
            {
                var voucher = await GetByIdAsync(entity.VoucherId);
                if (voucher is null)
                {
                    return new Response(false, $"{entity.VoucherName} not found");
                }
                context.Entry(voucher).State = EntityState.Detached;
                context.Vouchers.Update(entity);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.VoucherName} successfully updated");
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occurred updating existing voucher");
            }
        }
    }
}
