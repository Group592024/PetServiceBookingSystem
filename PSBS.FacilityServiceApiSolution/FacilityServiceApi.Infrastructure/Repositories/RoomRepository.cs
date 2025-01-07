using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class RoomRepository(FacilityServiceDbContext context) : IRoom
    {
        public async Task<Response> CreateAsync(Room entity)
        {
            try
            {
                var roomTypeExists = await context.RoomType.AnyAsync(rt => rt.roomTypeId == entity.roomTypeId && !rt.isDeleted);
                if (!roomTypeExists)
                {
                    return new Response(false, $"RoomType with ID {entity.roomTypeId} is not active or does not exist!");
                }
                var existingRoom = await context.Room.FirstOrDefaultAsync(r => r.roomId == entity.roomId);
                if (existingRoom != null)
                {
                    return new Response(false, $"Room with ID {entity.roomId} already exists!");
                }
                entity.isDeleted = false;
                var currentEntity = context.Room.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.roomId != Guid.Empty)
                    return new Response(true, $"{entity.roomId} added successfully");
                else
                    return new Response(false, "Error occurred while adding the room");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred adding new room");
            }
        }

        public async Task<Response> DeleteAsync(Room entity)
        {
            try
            {
                var room = await GetByIdAsync(entity.roomId);
                if (room == null)
                    return new Response(false, $"{entity.roomId} not found");

                if (room.isDeleted)
                {
                    context.Room.Remove(room);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.roomId} has been permanently deleted");
                }
                else
                {
                    room.isDeleted = true;
                    context.Room.Update(room);
                    await context.SaveChangesAsync();
                    return new Response(true, $"{entity.roomId} is marked as deleted successfully");
                }
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred performing delete operation on room");
            }
        }


        public async Task<IEnumerable<Room>> GetAllAsync()
        {
            try
            {
                var rooms = await context.Room
                                          .ToListAsync();
                return rooms ?? new List<Room>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving rooms");
            }
        }

        public async Task<Room> GetByAsync(Expression<Func<Room, bool>> predicate)
        {
            try
            {
                var room = await context.Room.Where(predicate).FirstOrDefaultAsync();

                return room ?? throw new InvalidOperationException("Room not found");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);

                throw new InvalidOperationException("Error occurred retrieving room", ex);
            }
        }

        public async Task<Room> GetByIdAsync(Guid id)
        {
            try
            {
                var room = await context.Room.FindAsync(id);
                if (room == null)
                {
                    LogExceptions.LogException(new Exception($"Room with ID {id} not found"));
                    return null;
                }
                return room;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving room");
            }
        }

        public async Task<Response> UpdateAsync(Room entity)
        {
            try
            {
                var room = await GetByIdAsync(entity.roomId);
                if (room == null)
                {
                    return new Response(false, $"Room with ID {entity.roomId} not found");
                }
                room.isDeleted = entity.isDeleted;
                room.roomTypeId = entity.roomTypeId;
                room.description = entity.description;
                room.status = entity.status;
                room.roomImage = entity.roomImage;
                room.hasCamera = entity.hasCamera;
                context.Room.Update(room);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.roomId} is updated successfully");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred updating the room");
            }
        }

        public async Task<IEnumerable<Room>> ListAvailableRoomsAsync()
        {
            try
            {
                var rooms = await context.Room
                                         .Where(r => !r.isDeleted)
                                         .ToListAsync();
                return rooms ?? new List<Room>();
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving non-deleted rooms");
            }
        }

        public async Task<Room> GetRoomDetailsAsync(Guid roomId)
        {
            try
            {
                var room = await context.Room
                                        .Where(r => r.roomId == roomId && !r.isDeleted)
                                        .FirstOrDefaultAsync();

                if (room == null)
                {
                    throw new InvalidOperationException($"Room with ID {roomId} not found or has been deleted");
                }
                return room;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new InvalidOperationException("Error occurred retrieving room details", ex);
            }
        }
    }
}
