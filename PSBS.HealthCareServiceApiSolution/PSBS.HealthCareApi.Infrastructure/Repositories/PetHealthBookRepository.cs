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
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PSBS.HealthCareApi.Infrastructure.Repositories
{
    public class PetHealthBookRepository(HealthCareDbContext context) : IPetHealthBook
    {
 

public async Task<Response> CreateAsync(PetHealthBook entity)
    {
        try
        {
            // 1. Kiểm tra nếu medicineId là rỗng
            if (entity.medicineId == Guid.Empty)
            {
                return new Response(false, "MedicineId cannot be empty");
            }

            // 2. Kiểm tra xem medicineId có tồn tại trong bảng Medicine hay không
            var existingMedicine = await context.Medicines
                                                 .FirstOrDefaultAsync(m => m.medicineId == entity.medicineId);

            if (existingMedicine == null)
            {
                return new Response(false, "MedicineId does not exist in the database");
            }

            // 3. Kiểm tra xem treatmentId liên kết với Medicine có tồn tại trong bảng Treatment không
            var existingTreatment = await context.Treatments
                                                 .FirstOrDefaultAsync(t => t.treatmentId == existingMedicine.treatmentId);

            if (existingTreatment == null)
            {
                return new Response(false, "The specified treatmentId does not exist in the Treatment table");
            }

            // 4. Kiểm tra nếu medicineId đã tồn tại trong bảng PetHealthBook
            var existingEntity = await context.PetHealthBooks
                                              .FirstOrDefaultAsync(p => p.medicineId == entity.medicineId);

            if (existingEntity != null)
            {
                // Nếu medicineId đã tồn tại, cập nhật các trường cần thiết
                existingEntity.bookingId = entity.bookingId;
                existingEntity.visitDate = entity.visitDate;
                existingEntity.nextVisitDate = entity.nextVisitDate;
                existingEntity.performBy = entity.performBy;
                existingEntity.updatedAt = DateTime.UtcNow;

                // Lưu thay đổi vào cơ sở dữ liệu
                context.PetHealthBooks.Update(existingEntity);
                await context.SaveChangesAsync();

                // Xử lý circular reference
                var options = new JsonSerializerOptions
                {
                    ReferenceHandler = ReferenceHandler.IgnoreCycles,
                    WriteIndented = true
                };

                return new Response(true, $"PetHealthBook with MedicineId {entity.medicineId} updated successfully")
                {
                    Data = JsonSerializer.Serialize(existingEntity, options)
                };
            }

            // 5. Nếu medicineId không tồn tại, thêm mới bản ghi vào PetHealthBook
            var currentEntity = context.PetHealthBooks.Add(entity).Entity;
            await context.SaveChangesAsync();

            // Xử lý circular reference
            var jsonOptions = new JsonSerializerOptions
            {
                ReferenceHandler = ReferenceHandler.IgnoreCycles,
                WriteIndented = true
            };

            return new Response(true, $"PetHealthBook with HealthBookId {entity.healthBookId} added successfully")
            {
                Data = JsonSerializer.Serialize(currentEntity, jsonOptions)
            };
        }
        catch (Exception ex)
        {
            LogExceptions.LogException(ex); // Log lỗi chi tiết
            return new Response(false, $"An error occurred: {ex.Message}");
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
