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

                if (!roomType.isDeleted)
                {
                    var roomsToUpdate = await context.Room
                                                     .Where(r => r.roomTypeId == entity.roomTypeId && !r.isDeleted)
                                                     .ToListAsync();

                    foreach (var room in roomsToUpdate)
                    {
                        var activeRoomHistory = await context.RoomHistories
                            .Where(rh => rh.RoomId == room.roomId && rh.CheckOutDate == null)
                            .FirstOrDefaultAsync();

                        if (activeRoomHistory != null)
                        {
                            activeRoomHistory.Status = "Soft Deleted";
                            activeRoomHistory.CheckOutDate = DateTime.Now;
                            context.RoomHistories.Update(activeRoomHistory);
                        }

                        room.isDeleted = true;
                        context.Room.Update(room);
                    }

                    roomType.isDeleted = true;
                    context.RoomType.Update(roomType);
                    await context.SaveChangesAsync();

                    return new Response(true, "RoomType and associated rooms soft deleted successfully.") { Data = roomType };
                }
                else
                {
                    var linkedRooms = await context.Room
                        .Where(r => r.roomTypeId == entity.roomTypeId)
                        .ToListAsync();

                    if (linkedRooms.Any())
                    {
                        return new Response(false, $"Cannot permanently delete RoomType with name {entity.name} because it has associated rooms.") ;
                    }

                    context.RoomType.Remove(roomType);
                    await context.SaveChangesAsync();
                    return new Response(true, $"RoomType with name {entity.name} has been permanently deleted.");
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
                var existingRoomTypeByName = await context.RoomType
                    .FirstOrDefaultAsync(rt => rt.name.ToLower() == entity.name.ToLower() && rt.roomTypeId != entity.roomTypeId);
                if (existingRoomTypeByName != null)
                {
                    return new Response(false, $"RoomType with name '{entity.name}' already exists!");
                }
                if (entity.isDeleted && existingRoomType.isDeleted)
                {
                    existingRoomType.isDeleted = false;
                }

                existingRoomType.name = entity.name;
                existingRoomType.description = entity.description;
                existingRoomType.pricePerHour = entity.pricePerHour;
                existingRoomType.pricePerDay = entity.pricePerDay;
                existingRoomType.isDeleted = entity.isDeleted;

                context.RoomType.Update(existingRoomType);
                await context.SaveChangesAsync();
                return new Response(true, $"{entity.name} updated successfully") { Data = existingRoomType };
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
