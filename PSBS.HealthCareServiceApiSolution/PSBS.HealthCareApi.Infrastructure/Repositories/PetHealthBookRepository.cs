using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSBS.HealthCareApi.Infrastructure.Data;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Infrastructure.Repositories
{
    public class PetHealthBookRepository(HealthCareDbContext context) : IPetHealthBook
    {
        public async Task<Response> CreateAsync(PetHealthBook entity)
        {
            try
            {
                var getPetHealthBook = await GetByAsync(p => p.healthBookId!.Equals(entity.healthBookId));
                var currentEntity = context.PetHealthBooks.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.healthBookId.ToString().Length > 0)
                {
                    return new Response(true, $"{entity.healthBookId} added to database successfully") { Data = currentEntity };
                }
                else
                {
                    return new Response(false, $"{entity.healthBookId} cannot be added due to errors");
                }
            }
            catch (Exception ex)
            {
                // log the orginal exception
                LogExceptions.LogException(ex);
                // display scary-free message to the client
                return new Response(false, "Error occured adding new PetHealthBook");
            }
        }
       

        public async Task<Response> DeleteAsync(PetHealthBook entity)
        {
            try
            {
                var petHealthBooks = await GetByIdAsync(entity.healthBookId);
                if (petHealthBooks is null)
                {
                    return new Response(false, $"{entity.healthBookId} not found");
                }

                if (!petHealthBooks.isDeleted)
                {
                    // First deletion attempt: mark as deleted
                    petHealthBooks.isDeleted = true;
                    context.PetHealthBooks.Update(petHealthBooks);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.healthBookId} marked as deleted.") { Data = petHealthBooks };
                }
                else
                {
                    // Check if BookingStatusId is still referenced in Bookings table
                    bool isReferencedInBookings = await context.PetHealthBooks
                        .AnyAsync(b => b.healthBookId == entity.healthBookId);

                    if (isReferencedInBookings)
                    {
                        return new Response(false, $"Cannot permanently delete {entity.healthBookId} because it is referenced in existing bookings.");
                    }

                    // Permanently delete from the database
                    context.PetHealthBooks.Remove(petHealthBooks);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.healthBookId} permanently deleted.");
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

        public async Task<IEnumerable<PetHealthBook>> GetAllAsync()
        {
            try
            {
                var petHealthBooks = await context.PetHealthBooks.ToListAsync();
                return petHealthBooks;
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
                var petHealthBooks = await context.PetHealthBooks.Where(predicate).FirstOrDefaultAsync()!;
                return petHealthBooks is not null ? petHealthBooks : null!;
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
                var petHealthBooks = await context.PetHealthBooks.AsNoTracking().SingleOrDefaultAsync(v => v.healthBookId == id);
                return petHealthBooks!;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred booking status.");
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

                petHealthBooks.healthBookId = entity.healthBookId == Guid.Empty ? petHealthBooks.healthBookId : entity.healthBookId;
                petHealthBooks.bookingId = entity.bookingId == Guid.Empty ? petHealthBooks.bookingId : entity.bookingId;
                petHealthBooks.medicineId = entity.medicineId == Guid.Empty ? petHealthBooks.medicineId : entity.medicineId;
                petHealthBooks.visitDate = entity.visitDate == default ? petHealthBooks.visitDate : entity.visitDate;
                petHealthBooks.nextVisitDate = entity.nextVisitDate == default ? petHealthBooks.nextVisitDate : entity.nextVisitDate;
                petHealthBooks.performBy = entity.performBy == string.Empty ? petHealthBooks.performBy : entity.performBy;
                petHealthBooks.createdAt = entity.createdAt == default ? petHealthBooks.createdAt : entity.createdAt;
                petHealthBooks.updatedAt = entity.updatedAt == default ? petHealthBooks.updatedAt : entity.updatedAt;
                petHealthBooks.isDeleted = entity.isDeleted;

                context.Entry(petHealthBooks).State = EntityState.Modified;

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
