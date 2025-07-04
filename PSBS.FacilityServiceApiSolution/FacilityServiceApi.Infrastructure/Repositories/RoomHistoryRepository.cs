﻿using FacilityServiceApi.Application.Interfaces;
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
    public class RoomHistoryRepository(FacilityServiceDbContext context) : IRoomHistory
    {
        public async Task<Response> CheckoutRoomHistory(Guid roomHistoryId)
        {
            try
            {
                var existingEntity = await context.RoomHistories
                    .FirstOrDefaultAsync(r => r.RoomHistoryId == roomHistoryId);

                if (existingEntity == null) // Fixed condition (removed the incorrect check)
                {
                    return new Response(false, "Room history not found");
                }

                existingEntity.CheckOutDate = DateTime.Now;
                existingEntity.Status = "Checked out";

                context.RoomHistories.Update(existingEntity);
                await context.SaveChangesAsync();

                return new Response(true, "Checked out room history successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred while checking out room history");
            }
        }

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

        public async Task<RoomHistory> GetByIdAsync(Guid id)
        {
            try
            {
                var roomHistory = await context.RoomHistories.FindAsync(id);
                if (roomHistory == null)
                {
                    LogExceptions.LogException(new Exception($"Room History with ID {id} not found"));
                    return null;
                }
                return roomHistory;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving room History");
            }
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
        public async Task<Response> UpdateCameraAsync(Guid roomHistoryId, Guid cameraId)
        {
            try
            {
                var existingEntity = await context.RoomHistories.FirstOrDefaultAsync(h => h.RoomHistoryId == roomHistoryId);
                if (existingEntity == null)
                {
                    return new Response(false, "RoomHistory not found");
                }

                var cameraExists = await context.Camera.AnyAsync(c => c.cameraId == cameraId);
                if (!cameraExists)
                {
                    return new Response(false, "Camera not found");
                }

                existingEntity.cameraId = cameraId;

                context.RoomHistories.Update(existingEntity);
                await context.SaveChangesAsync();

                return new Response(true, "Camera updated successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ UpdateCameraAsync error: {ex.Message}");
                return new Response(false, "Error occurred updating camera");
            }
        }


    }
}
