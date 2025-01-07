using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class RoomTypeRepository(FacilityServiceDbContext context) : IRoomType
    {
        public async Task<Response> CreateAsync(RoomType entity)
        {
            try
            {
                var existingRoomType = await context.RoomType.FirstOrDefaultAsync(rt => rt.roomTypeId == entity.roomTypeId);
                if (existingRoomType != null)
                {
                    return new Response(false, $"RoomType with ID {entity.roomTypeId} already exists!");
                }
                entity.isDeleted = false;
                var currentEntity = context.RoomType.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.roomTypeId != Guid.Empty)
                    return new Response(true, $"{entity.roomTypeId} added successfully");
                else
                    return new Response(false, "Error occurred while adding the room type");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred adding new RoomType: {ex.Message}");
            }
        }

        public async Task<Response> DeleteAsync(RoomType entity)
        {
            try
            {
                var roomUsingRoomType = await context.Room
                                                      .AnyAsync(r => r.roomTypeId == entity.roomTypeId && !r.isDeleted);
                if (roomUsingRoomType)
                {
                    return new Response(false, $"Cannot delete RoomType with ID {entity.roomTypeId} because there are rooms using it.");
                }

                var roomType = await context.RoomType.FirstOrDefaultAsync(rt => rt.roomTypeId == entity.roomTypeId);
                if (roomType != null)
                {
                    if (roomType.isDeleted)
                    {
                        context.RoomType.Remove(roomType);
                        await context.SaveChangesAsync();
                        return new Response(true, $"RoomType with ID {entity.roomTypeId} has been permanently deleted.");
                    }
                    else
                    {
                        roomType.isDeleted = true;
                        context.RoomType.Update(roomType);
                        await context.SaveChangesAsync();
                        return new Response(true, "RoomType soft deleted successfully.");
                    }
                }

                return new Response(false, "RoomType not found.");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred while deleting RoomType: {ex.Message}");
            }
        }

        public async Task<IEnumerable<RoomType>> GetAllAsync()
        {
            try
            {
                var roomtypes = await context.RoomType
                          .ToListAsync();
                return roomtypes ?? new List<RoomType>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving RoomTypes: {ex.Message}");
            }
        }

        public async Task<RoomType> GetByAsync(Expression<Func<RoomType, bool>> predicate)
        {
            try
            {
                var roomtype = await context.RoomType.Where(predicate).FirstOrDefaultAsync();
                return roomtype ?? throw new InvalidOperationException("RoomType not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving RoomType by condition: {ex.Message}");
            }
        }

        public async Task<RoomType> GetByIdAsync(Guid id)
        {
            try
            {
                var roomtype = await context.RoomType.FindAsync(id);
                if (roomtype == null)
                {
                    LogExceptions.LogException(new Exception($"RoomType with ID {id} not found"));
                    return null;
                }
                return roomtype;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException($"Error occurred retrieving RoomType by Id: {ex.Message}");
            }
        }

        public async Task<Response> UpdateAsync(RoomType entity)
        {
            try
            {
                var existingRoomType = await GetByIdAsync(entity.roomTypeId);
                if (existingRoomType == null)
                {
                    return new Response(false, $"RoomType with ID {entity.roomTypeId} not found or already deleted");
                }

                existingRoomType.name = entity.name;
                existingRoomType.description = entity.description;
                existingRoomType.pricePerHour = entity.pricePerHour;
                existingRoomType.pricePerDay = entity.pricePerDay;
                existingRoomType.isDeleted = entity.isDeleted;

                context.RoomType.Update(existingRoomType);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.roomTypeId} updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, $"Error occurred updating the RoomType: {ex.Message}");
            }
        }

        public async Task<IEnumerable<RoomType>> ListAvailableRoomTypeAsync()
        {
            try
            {
                var roomtypes = await context.RoomType
                                         .Where(r => !r.isDeleted)
                                         .ToListAsync();
                return roomtypes ?? new List<RoomType>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving non-deleted rooms");
            }
        }

    }
}
