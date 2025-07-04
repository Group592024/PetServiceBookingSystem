﻿using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

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
                var existingRoomTypeByName = await context.RoomType
                                                                  .FirstOrDefaultAsync(rt => rt.name.ToLower() == entity.name.ToLower());
                if (existingRoomTypeByName != null)
                {
                    return new Response(false, $"RoomType with name '{entity.name}' already exists!");
                }

                entity.isDeleted = false;
                var currentEntity = context.RoomType.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.roomTypeId != Guid.Empty)
                    return new Response(true, $"{entity.name} added successfully") { Data = currentEntity };
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
                var roomType = await context.RoomType.FirstOrDefaultAsync(rt => rt.roomTypeId == entity.roomTypeId);

                if (roomType == null)
                {
                    return new Response(false, "RoomType not found.");
                }

                var linkedRooms = await context.Room
                                               .Where(r => r.roomTypeId == entity.roomTypeId)
                                               .ToListAsync();

                if (roomType.isDeleted)
                {
                    if (!linkedRooms.Any())
                    {
                        context.RoomType.Remove(roomType);
                        await context.SaveChangesAsync();
                        return new Response(true, $"RoomType with name {entity.name} has been permanently deleted.");
                    }
                    else
                    {
                        return new Response(false, $"Cannot permanently delete RoomType with name {entity.name} because there are linked rooms.");
                    }
                }
                else
                {
                    foreach (var room in linkedRooms)
                    {
                        room.isDeleted = true;
                        context.Room.Update(room);
                    }

                    roomType.isDeleted = true;
                    context.RoomType.Update(roomType);
                    await context.SaveChangesAsync();

                    var roomTypeDto = new RoomTypeDTO
                    {
                        roomTypeId = roomType.roomTypeId,
                        name = roomType.name,
                        price = roomType.price,
                        description = roomType.description,
                        isDeleted = roomType.isDeleted
                    };

                    return new Response(true, "RoomType and associated rooms soft deleted successfully.") { Data = roomTypeDto };
                }
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
                var roomtypes = await context.RoomType.Include(p => p.Rooms)
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
                    return new Response(false, $"RoomType with ID {entity.roomTypeId} not found or already deleted.");
                }

                var existingRoomTypeByName = await context.RoomType
                    .FirstOrDefaultAsync(rt => rt.name.ToLower() == entity.name.ToLower() && rt.roomTypeId != entity.roomTypeId);
                if (existingRoomTypeByName != null)
                {
                    return new Response(false, $"RoomType with name '{entity.name}' already exists!");
                }

                existingRoomType.name = entity.name;
                existingRoomType.description = entity.description;
                existingRoomType.price = entity.price;
                existingRoomType.isDeleted = entity.isDeleted;

                context.RoomType.Update(existingRoomType);
                await context.SaveChangesAsync();

                var roomTypeDto = new RoomTypeDTO
                {
                    roomTypeId = existingRoomType.roomTypeId,
                    name = existingRoomType.name,
                    price = existingRoomType.price,
                    description = existingRoomType.description,
                    isDeleted = existingRoomType.isDeleted
                };

                return new Response(true, $"{entity.name} updated successfully") { Data = roomTypeDto };
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
                                         .Include(p => p.Rooms)
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
