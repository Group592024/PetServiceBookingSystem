

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

                if (!voucher.IsDeleted)
                {
                    // First deletion attempt: mark as deleted
                    voucher.IsDeleted = true;
                    context.Vouchers.Update(voucher);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.VoucherName} marked as deleted.") { Data = voucher };
                }
                else
                {
                    //// Check if BookingStatusId is still referenced in Bookings table
                    //bool isReferencedInBookings = await context.Bookings
                    //    .AnyAsync(b => b.BookingStatusId == entity.BookingStatusId);

                    //if (isReferencedInBookings)
                    //{
                    //    return new Response(false, $"Cannot permanently delete {entity.BookingStatusName} because it is referenced in existing bookings.");
                    //}

                    // Permanently delete from the database
                    context.Vouchers.Remove(voucher);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.VoucherName} permanently deleted.");
                }
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "An error occurred while deleting the booking status.");
            }
        }

        public async Task<IEnumerable<Voucher>> GetAllAsync()
        {
            try
            {
                var vouchers = await context.Vouchers
                    .AsNoTracking()
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

        public async Task<IEnumerable<Voucher>> GetAllForCustomer()
        {
            try
            {
                var vouchers = await context.Vouchers
                    .AsNoTracking()
                    .Where(v => !v.IsDeleted && !v.IsGift) // Filter where isDeleted is false
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
                    .SingleOrDefaultAsync(v => v.VoucherId == id); 
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

        public async Task<IEnumerable<Voucher>> GetValidVoucherForCustomer()
        {
            try
            {
                var vouchers = await context.Vouchers
                    .AsNoTracking()
                    .Where(v => !v.IsDeleted && !v.IsGift && v.VoucherQuantity > 0 && v.VoucherStartDate <= DateTime.Now && v.VoucherEndDate >= DateTime.Now) 
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

        public async Task<Response> MinusVoucherQuanitty(Guid id)
        {
            try
            {
                var existingVoucher = await context.Vouchers.FirstOrDefaultAsync(v => v.VoucherId == id);
                if (existingVoucher == null)
                {
                    return new Response(false, "Voucher does not exist.");
                }
                existingVoucher.VoucherQuantity--;
                if(existingVoucher.VoucherQuantity == 0)
                {
                    existingVoucher.IsDeleted = true;
                }
                context.Vouchers.Update(existingVoucher);
                await context.SaveChangesAsync();
                return new Response(true, "Voucher quantity updated successfully.");
            }
            catch(Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred update voucher quantity.");
            }
        }

        public async Task<Response> UpdateAsync(Voucher entity)
        {
            try
            {
                var existingVoucher = await GetByIdAsync(entity.VoucherId);
                if (existingVoucher is null)
                {
                    return new Response(false, $"{entity.VoucherName} not found");
                }

                // Check if the new name already exists in another voucher
                if (entity.VoucherName != existingVoucher.VoucherName)
                {
                    var nameExists = await context.Vouchers.AnyAsync(v => v.VoucherName == entity.VoucherName && v.VoucherId != entity.VoucherId);
                    if (nameExists)
                    {
                        return new Response(false, $"Voucher name '{entity.VoucherName}' is already in use.");
                    }
                }

                // Check if the new code already exists in another voucher
                if (entity.VoucherCode != existingVoucher.VoucherCode)
                {
                    var codeExists = await context.Vouchers.AnyAsync(v => v.VoucherCode == entity.VoucherCode && v.VoucherId != entity.VoucherId);
                    if (codeExists)
                    {
                        return new Response(false, $"Voucher code '{entity.VoucherCode}' is already in use.");
                    }
                }

                // Update other fields as needed
                entity.VoucherStartDate = existingVoucher.VoucherStartDate;

                // Detach the existing entity to prevent conflicts
                context.Entry(existingVoucher).State = EntityState.Detached;

                // Update the entity
                context.Vouchers.Update(entity);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.VoucherName} successfully updated");
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "Error occurred updating existing voucher");
            }
        }

    }
}
