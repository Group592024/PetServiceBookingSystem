using FacilityServiceApi.Application.DTO;
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
                var existingRoomByName = await context.Room.FirstOrDefaultAsync(r => r.roomName == entity.roomName);
                if (existingRoomByName != null)
                {
                    return new Response(false, $"Room with name {entity.roomName} already exists!");
                }
                entity.status = "Free";
                entity.isDeleted = false;
                var currentEntity = context.Room.Add(entity).Entity;
                await context.SaveChangesAsync();

                if (currentEntity != null && currentEntity.roomId != Guid.Empty)
                {
                    var roomDto = new RoomDTO
                    {
                        roomId = currentEntity.roomId,
                        roomName = currentEntity.roomName,
                        status = currentEntity.status,
                        roomTypeId = currentEntity.roomTypeId,
                        description = currentEntity.description,
                        roomImage = currentEntity.roomImage,
                        isDeleted  = currentEntity.isDeleted,
                    };

                    return new Response(true, $"{entity.roomId} added successfully") { Data = roomDto };
                }
                else
                {
                    return new Response(false, "Error occurred while adding the room");
                }
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
                var room = await context.Room
                    .Where(r => r.roomId == entity.roomId)
                    .FirstOrDefaultAsync();

                if (room == null)
                {
                    return new Response(false, $"{entity.roomId} not found or is already deleted.");
                }

                if (!room.isDeleted)
                {
                    room.isDeleted = true;
                    context.Room.Update(room);
                    await context.SaveChangesAsync();

                    var roomDto = new RoomDTO
                    {
                        roomId = room.roomId,
                        roomName = room.roomName,
                        status = room.status,
                        roomTypeId = room.roomTypeId,
                        description = room.description,
                        roomImage = room.roomImage,
                        isDeleted = room.isDeleted,
                    };

                    return new Response(true, $"{entity.roomName} has been marked as deleted (soft delete) successfully.") { Data = roomDto };
                }

                var roomHistoryExists = await context.RoomHistories
                    .AnyAsync(rh => rh.RoomId == entity.roomId);

                if (roomHistoryExists)
                {
                    return new Response(false, $"Room {entity.roomName} cannot be permanently deleted as it has room history.");
                }

                context.Room.Remove(room);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.roomName} has been permanently deleted.");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred during the delete operation.");
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

                if (room.status == "In Use")
                {
                    return new Response(false, $"Room {entity.roomName} cannot be updated as its status is 'In Use'.");
                }

                var duplicateRoomName = await context.Room
                                     .Where(r => r.roomName == entity.roomName && r.roomId != entity.roomId)
                                     .FirstOrDefaultAsync();
                if (duplicateRoomName != null)
                {
                    return new Response(false, $"Room with name {entity.roomName} already exists!");
                }

                room.roomTypeId = entity.roomTypeId;
                room.roomName = entity.roomName;
                room.description = entity.description;
                room.roomImage = entity.roomImage;
                room.status = entity.status;
                room.isDeleted = entity.isDeleted;

                context.Room.Update(room);
                await context.SaveChangesAsync();

                return new Response(true, $"{entity.roomId} is updated successfully") { Data = room };
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
                                         .Where(r => !r.isDeleted && r.status == "Free")
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
