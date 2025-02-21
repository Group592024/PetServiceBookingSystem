using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    internal class RoomHistoryRepository(FacilityServiceDbContext context) : IRoomHistory
    {
        public async Task<Response> CreateAsync(RoomHistory entity)
        {
            try
            {
                var currentEntity = context.RoomHistories.Add(entity).Entity;
                await context.SaveChangesAsync();
                if (currentEntity is not null && currentEntity.RoomHistoryId != Guid.Empty)
                {

                    return new Response(true, "Create room history successfully");
                }
                else
                {
                    return new Response(false, "Cannot create room history due to errors");
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occured adding new room history");
            }
        }

        public async Task<IEnumerable<RoomHistory>> GetAllAsync()
        {
            var roomHistories = await context.RoomHistories.ToListAsync();
            return roomHistories;
        }

        public Task<RoomHistory> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<RoomHistory>> GetRoomHistoryByBookingId(Guid id)
        {
            var bookingRoomHistories = await context.RoomHistories.Where(i => i.BookingId == id).ToListAsync();
            return bookingRoomHistories;
        }

        public async Task<Response> UpdateAsync(RoomHistory entity)
        {
            try
            {
                var existingEntity = await context.RoomHistories.FirstOrDefaultAsync(h => h.RoomHistoryId == entity.RoomHistoryId);
                if (existingEntity == null)
                {
                    return new Response(false, "Cannot update room history due to errors");
                }
                existingEntity.Status = entity.Status;
                existingEntity.CheckInDate = entity.CheckInDate;
                existingEntity.CheckOutDate = entity.CheckOutDate;
                var currentEntity = context.RoomHistories.Update(existingEntity).Entity;
                await context.SaveChangesAsync();
                return new Response(true, "Update room history successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occured update new room history");
            }
        }
    }
}
