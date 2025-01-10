
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using System.Linq.Expressions;

namespace ReservationApi.Infrastructure.Repositories
{
    public class PaymentTypeRepository(ReservationServiceDBContext context) : IPaymentType
    {
        public async Task<Response> CreateAsync(PaymentType entity)
        {
            try
            {
                var getPaymentType = await GetByAsync(p => p.PaymentTypeName!.Equals(entity.PaymentTypeName));
                if (getPaymentType is not null && !string.IsNullOrEmpty(getPaymentType.PaymentTypeName))
                    return new Response(false, $"{entity.PaymentTypeName} already added");

                var currentEntity = context.PaymentTypes.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.PaymentTypeId.ToString().Length > 0)
                {
                    return new Response(true, $"{entity.PaymentTypeName} added to database successfully") { Data = currentEntity };
                }
                else
                {
                    return new Response(false, $"{entity.PaymentTypeName} cannot be added due to errors");
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

        public async Task<Response> DeleteAsync(PaymentType entity)
        {
            try
            {
                var paymentType = await GetByIdAsync(entity.PaymentTypeId);
                if (paymentType is null)
                {
                    return new Response(false, $"{entity.PaymentTypeName} not found");
                }

                if (!paymentType.isDeleted)
                {
                    // First deletion attempt: mark as deleted
                    paymentType.isDeleted = true;
                    context.PaymentTypes.Update(paymentType);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.PaymentTypeName} marked as deleted.") { Data = paymentType };
                }
                else
                {
                    // Check if paymentType is still referenced in Bookings table
                    bool isReferencedInBookings = await context.Bookings
                        .AnyAsync(b => b.BookingStatusId == entity.PaymentTypeId);

                    if (isReferencedInBookings)
                    {
                        return new Response(false, $"Cannot permanently delete {entity.PaymentTypeName} because it is referenced in existing bookings.");
                    }

                    // Permanently delete from the database
                    context.PaymentTypes.Remove(paymentType);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.PaymentTypeName} permanently deleted.");
                }
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "An error occurred while deleting the booking type");
            }
        }

        public async Task<IEnumerable<PaymentType>> GetAllAsync()
        {
            try
            {
                var paymentTypes = await context.PaymentTypes.ToListAsync();
                return paymentTypes;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while retrieving payment type");
            }
        }

        public async Task<PaymentType> GetByAsync(Expression<Func<PaymentType, bool>> predicate)
        {
            try
            {
                var paymentType = await context.PaymentTypes.Where(predicate).FirstOrDefaultAsync()!;
                return paymentType is not null ? paymentType : null!;
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                throw new Exception("Error occurred retrieving v status");
            }
        }

        public async Task<PaymentType> GetByIdAsync(Guid id)
        {
            try
            {
                var paymentType = await context.PaymentTypes
                    .AsNoTracking()
                    .SingleOrDefaultAsync(v => v.PaymentTypeId == id);
                return paymentType!;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred payment type");
            }
        }

        public async Task<Response> UpdateAsync(PaymentType entity)
        {
            try
            {
                var paymentType = await GetByIdAsync(entity.PaymentTypeId);
                if (paymentType is null)
                {
                    return new Response(false, $"{entity.PaymentTypeName} not found");
                }
                if (paymentType.PaymentTypeName != entity.PaymentTypeName)
                {
                    var getPaymentType = await GetByAsync(p => p.PaymentTypeName!.Equals(entity.PaymentTypeName));
                    if (getPaymentType is not null && !string.IsNullOrEmpty(getPaymentType.PaymentTypeName))
                        return new Response(false, $"{entity.PaymentTypeName} already added");
                }
                
                context.Entry(paymentType).State = EntityState.Detached;
                context.PaymentTypes.Update(entity);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.PaymentTypeName} successfully updated") { Data = entity };
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occurred updating the existing booking status");
            }
        }
    }
}
