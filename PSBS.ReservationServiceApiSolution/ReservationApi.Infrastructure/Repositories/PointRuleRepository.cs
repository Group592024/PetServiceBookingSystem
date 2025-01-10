

using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using System.Linq.Expressions;

namespace ReservationApi.Infrastructure.Repositories
{
    public class PointRuleRepository(ReservationServiceDBContext context) : IPointRule
    {
        public async Task<Response> CreateAsync(PointRule entity)
        {
            try
            {
                // Check if there's an active PointRule (isDeleted is false)
                var activePointRule = await context.PointRules.AnyAsync(pr => !pr.isDeleted);
                if (activePointRule)
                {
                    return new Response(false, "Please inactivate the current Point Rule Ratio before adding a new one.");
                }

                // Add the new PointRule entity
                var currentEntity = context.PointRules.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity is not null && currentEntity.PointRuleId.ToString().Length > 0)
                {
                    return new Response(true, $"{entity.PointRuleRatio} added to database successfully") { Data = currentEntity };
                }
                else
                {
                    return new Response(false, $"{entity.PointRuleRatio} cannot be added due to errors");
                }
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "Error occurred while adding a new Point Rule.");
            }
        }


        public async Task<Response> DeleteAsync(PointRule entity)
        {
            try
            {
                var pointRule = await GetByIdAsync(entity.PointRuleId);
                if (pointRule is null)
                {
                    return new Response(false, $"{entity.PointRuleRatio} not found");
                }

                if (!pointRule.isDeleted)
                {
                    // First deletion attempt: mark as deleted
                    pointRule.isDeleted = true;
                    context.PointRules.Update(pointRule);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.PointRuleRatio} marked as deleted.") { Data = pointRule };
                }
                else
                {
                    // Check if BookingStatusId is still referenced in Bookings table
                    bool isReferencedInBookings = await context.Bookings
                        .AnyAsync(b => b.BookingStatusId == entity.PointRuleId);

                    if (isReferencedInBookings)
                    {
                        return new Response(false, $"Cannot permanently delete {entity.PointRuleRatio} because it is referenced in existing bookings.");
                    }

                    // Permanently delete from the database
                    context.PointRules.Remove(pointRule);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.PointRuleRatio} permanently deleted.");
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

        public async Task<IEnumerable<PointRule>> GetAllAsync()
        {
            try
            {
                var pointRules = await context.PointRules.ToListAsync();
                return pointRules;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while retrieving booking type");
            }
        }

        public async Task<PointRule> GetByAsync(Expression<Func<PointRule, bool>> predicate)
        {
            try
            {
                var pointRule = await context.PointRules.Where(predicate).FirstOrDefaultAsync()!;
                return pointRule is not null ? pointRule : null!;
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                throw new Exception("Error occurred retrieving booking status");
            }
        }

        public async Task<PointRule> GetByIdAsync(Guid id)
        {
            try
            {
                var pointRule = await context.PointRules
                    .AsNoTracking()
                    .SingleOrDefaultAsync(v => v.PointRuleId == id);
                return pointRule!;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred booking type");
            }
        }

        public async Task<Response> UpdateAsync(PointRule entity)
        {
            try
            {
                var pointRule = await GetByIdAsync(entity.PointRuleId);
                if (pointRule is null)
                {
                    return new Response(false, $"{entity.PointRuleRatio} not found");
                }

                // Check if isDeleted is being changed from true to false
                if (!entity.isDeleted && pointRule.isDeleted)
                {
                    // Check if there's any other active PointRule (isDeleted == false)
                    var activePointRuleExists = await context.PointRules
                        .AnyAsync(pr => !pr.isDeleted && pr.PointRuleId != entity.PointRuleId);

                    if (activePointRuleExists)
                    {
                        return new Response(false, "Please inactivate the current Point Rule Ratio before making another active.");
                    }
                }

                context.Entry(pointRule).State = EntityState.Detached;
                context.PointRules.Update(entity);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.PointRuleRatio} successfully updated") { Data = entity };
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a user-friendly message to the client
                return new Response(false, "Error occurred while updating the existing Point Rule.");
            }
        }

    }
}
