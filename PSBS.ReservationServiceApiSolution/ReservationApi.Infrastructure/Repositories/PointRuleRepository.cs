

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
               entity.isDeleted = true;

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
                var pointRule = await context.PointRules.FindAsync(entity.PointRuleId);
                if (pointRule is null)
                {
                    return new Response(false, $"{entity.PointRuleRatio} not found");
                }

                if (!pointRule.isDeleted)
                {
                    // Check if this is the last active PointRule
                    int activeCount = await context.PointRules.CountAsync(pr => !pr.isDeleted);
                    if (activeCount <= 1)
                    {
                        return new Response(false, "At least one active point rule must exist.");
                    }

                    // First deletion attempt: mark as deleted
                    pointRule.isDeleted = true;
                    context.PointRules.Update(pointRule);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.PointRuleRatio} marked as deleted.") { Data = pointRule };
                }
                else
                {
                    // Check if PointRule is still referenced in Bookings
                    bool isReferencedInBookings = await context.Bookings
                        .AnyAsync(b => b.PointRuleId == entity.PointRuleId);

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
                LogExceptions.LogException(ex);
                return new Response(false, "An error occurred while deleting the point rule.");
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

        public async Task<PointRule> GetPointRuleActiveAsync()
        {
            try
            {
                var pointRule = await context.PointRules.FirstOrDefaultAsync(p => !p.isDeleted);
                return pointRule!;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while retrieving point rule");
            }
        }

        public async Task<Response> UpdateAsync(PointRule entity)
        {
            try
            {
                var pointRule = await context.PointRules.FindAsync(entity.PointRuleId);

                if (pointRule is null)
                {
                    return new Response(false, $"{entity.PointRuleRatio} not found");
                }

                // Prevent deactivating the last active PointRule
                if (entity.isDeleted && !pointRule.isDeleted)
                {
                    int activeCount = await context.PointRules.CountAsync(pr => !pr.isDeleted);
                    if (activeCount <= 1)
                    {
                        return new Response(false, "At least one active point rule must exist.");
                    }
                }

                // Reactivating this PointRule — deactivate others
                if (!entity.isDeleted && pointRule.isDeleted)
                {
                    var otherPointRules = await context.PointRules
                        .Where(pr => pr.PointRuleId != entity.PointRuleId)
                        .ToListAsync();

                    foreach (var other in otherPointRules)
                    {
                        other.isDeleted = true;
                        context.PointRules.Update(other);
                    }
                }
              
                context.Entry(pointRule).State = EntityState.Detached;
                context.PointRules.Update(entity);
                await context.SaveChangesAsync();
                var list = await context.PointRules.ToListAsync();
                return new Response(true, $"{entity.PointRuleRatio} successfully updated") { Data = list };
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred while updating the existing Point Rule.");
            }
        }

    }
}
