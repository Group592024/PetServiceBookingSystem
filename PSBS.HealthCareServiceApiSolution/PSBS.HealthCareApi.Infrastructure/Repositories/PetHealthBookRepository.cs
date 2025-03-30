using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Polly;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;
namespace PSBS.HealthCareApi.Infrastructure.Repositories
{
    public class PetHealthBookRepository(HealthCareDbContext context) : IPetHealthBook
    {

        public async Task<Response> CreateAsync(PetHealthBook entity)
        {
            try
            {
                if (entity.medicineIds == null || !entity.medicineIds.Any())
                    return new Response(false, "Medicines collection cannot be empty");

                var medicines = await context.Medicines
                    .Where(m => entity.medicineIds.Contains(m.medicineId))
                    .ToListAsync();

                if (medicines.Count != entity.medicineIds.Count)
                    return new Response(false, "Some medicines not found.");

                var addedEntity = context.PetHealthBooks.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (addedEntity.healthBookId == Guid.Empty)
                    return new Response(false, "healthBookId is null after SaveChanges.");

                return new Response(true, "PetHealthBook with Medicines added successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"An error occurred: {ex.Message}");
            }
        }
        public async Task<Response> DeleteAsync(PetHealthBook entity)
        {
            try
            {
                var petHealthBooks = await GetByIdAsync(entity.healthBookId);
                if (petHealthBooks == null)
                {
                    return new Response(false, $"{entity.healthBookId} not found");
                }

                if (!petHealthBooks.isDeleted)
                {
                    petHealthBooks.isDeleted = true;
                    context.PetHealthBooks.Update(petHealthBooks);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.healthBookId} marked as deleted.") { Data = petHealthBooks };
                }
                else
                {
                    bool isReferencedInBookings = await context.PetHealthBooks
                        .AnyAsync(b => b.healthBookId == entity.healthBookId && !b.isDeleted);

                    if (isReferencedInBookings)
                    {
                        return new Response(false, $"Cannot permanently delete {entity.healthBookId} because it is referenced in existing bookings.");
                    }

                    context.PetHealthBooks.Remove(petHealthBooks);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.healthBookId} permanently deleted.");
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "An error occurred while deleting the booking status.");
            }
        }

        public async Task<IEnumerable<PetHealthBook>> GetAllAsync()
        {
            try
            {
                return await context.PetHealthBooks.Include(p => p.Medicines).AsNoTracking().ToListAsync();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred while retrieving booking Status.");
            }
        }

        public async Task<PetHealthBook> GetByAsync(Expression<Func<PetHealthBook, bool>> predicate)
        {
            try
            {
                return await context.PetHealthBooks.Include(p => p.Medicines).AsNoTracking().FirstOrDefaultAsync(predicate);
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving booking status");
            }
        }

        public async Task<PetHealthBook> GetByIdAsync(Guid id)
        {
            try
            {
                return await context.PetHealthBooks.Include(p => p.Medicines).AsNoTracking().SingleOrDefaultAsync(v => v.healthBookId == id);
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred booking status.");
            }
        }

        public async Task<IEnumerable<PetHealthBook>> GetUpcomingVisitsAsync(int daysBefore = 1)
        {
            try
            {
                var currentDate = DateTime.UtcNow.Date;
                var targetDate = currentDate.AddDays(daysBefore);

                var upcomingVisits = await context.PetHealthBooks
                    .Include(p => p.Medicines)
                    .Where(p => p.nextVisitDate.HasValue &&
                               !p.isDeleted &&
                               p.nextVisitDate.Value.Date >= currentDate &&
                               p.nextVisitDate.Value.Date <= targetDate)
                    .AsNoTracking()
                    .ToListAsync();
                return upcomingVisits;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred pethealth.");
            }
        }

        public async Task<Response> UpdateAsync(PetHealthBook entity)
        {
            try
            {
                var petHealthBooks = await GetByIdAsync(entity.healthBookId);

                if (petHealthBooks == null)
                {
                    return new Response(false, $"{entity.healthBookId} not found");
                }

                petHealthBooks.BookingServiceItemId = entity.BookingServiceItemId;
                petHealthBooks.visitDate = entity.visitDate;
                petHealthBooks.nextVisitDate = entity.nextVisitDate;
                petHealthBooks.performBy = entity.performBy;
                petHealthBooks.updatedAt = DateTime.UtcNow;

                if (entity.medicineIds != null && entity.medicineIds.Any())
                {
                    var medicines = await context.Medicines
                        .Where(m => entity.medicineIds.Contains(m.medicineId))
                        .ToListAsync();

                    if (medicines.Count != entity.medicineIds.Count)
                        return new Response(false, "Some medicines not found.");

                    petHealthBooks.medicineIds = entity.medicineIds;
                }

                context.PetHealthBooks.Update(petHealthBooks);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.healthBookId} successfully updated") { Data = petHealthBooks };
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating the existing booking status");
            }
        }
    }
}