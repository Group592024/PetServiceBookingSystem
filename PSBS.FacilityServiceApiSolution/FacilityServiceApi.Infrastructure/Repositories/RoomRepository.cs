using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using System;
using System.Linq.Expressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using System.Threading.Channels;
using System.Diagnostics.Metrics;
using System.Diagnostics;

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
                var room = await context.Room
                    .Where(r => r.roomId == entity.roomId && r.status == false)
                    .FirstOrDefaultAsync();

                if (room == null)
                {
                    return new Response(false, $"{entity.roomId} not found or is already deleted or in use.");
                }

                var activeRoomHistory = await context.RoomHistories
                    .Where(rh => rh.RoomId == entity.roomId && rh.CheckOutDate > DateTime.Now && rh.Status == "In Use")
                    .FirstOrDefaultAsync();

                if (activeRoomHistory != null)
                {
                    return new Response(false, $"Room {entity.roomId} cannot be deleted until check-out is complete.");
                }

                var roomHistoryExists = await context.RoomHistories
                    .Where(rh => rh.RoomId == entity.roomId)
                    .AnyAsync();

                if (!roomHistoryExists)
                {
                    if (!room.isDeleted)
                    {
                        room.isDeleted = true;
                        context.Room.Update(room);
                        await context.SaveChangesAsync();
                        return new Response(true, $"{entity.roomId} has been marked as deleted successfully.");

                    }
                    else
                    {
                        context.Room.Remove(room);
                        await context.SaveChangesAsync();
                        return new Response(true, $"{entity.roomId} has been permanently deleted.");
                    }
                }
                else
                {
                    var roomHistory = new RoomHistory
                    {
                        RoomId = room.roomId,
                        Status = room.isDeleted ? "Permanently Deleted" : "Soft Deleted",
                        CheckInDate = DateTime.Now,
                        CheckOutDate = room.isDeleted ? DateTime.Now : DateTime.MinValue
                    };

                    context.RoomHistories.Add(roomHistory);

                    if (!room.isDeleted)
                    {
                        room.isDeleted = true;
                        context.Room.Update(room);
                    }
                    else
                    {
                        context.Room.Remove(room);
                    }
                }

                if (room.hasCamera)
                {
                    var roomHistoryWithCamera = await context.RoomHistories
                        .Where(rh => rh.RoomId == entity.roomId)
                        .OrderByDescending(rh => rh.CheckInDate)
                        .FirstOrDefaultAsync();

                    if (roomHistoryWithCamera?.Camera != null)
                    {
                        var camera = roomHistoryWithCamera.Camera;
                        camera.cameraStatus = "Inactive";
                        context.Camera.Update(camera);
                    }
                }

                await context.SaveChangesAsync();
                return new Response(true, $"{entity.roomId} has been marked as deleted successfully.");
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                return new Response(false, "Error occurred during the delete operation");
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

                if (room.status == true)
                {
                    var activeRoomHistory = await context.RoomHistories
                                                            .Where(rh => rh.RoomId == entity.roomId && rh.Status == "In Use" && rh.CheckOutDate == DateTime.MinValue)
                                                            .FirstOrDefaultAsync();

                    if (activeRoomHistory != null)
                    {
                        return new Response(false, $"Room {entity.roomId} is currently in use and cannot be updated.");
                    }

                    room.roomTypeId = entity.roomTypeId;
                    room.description = entity.description;
                    room.roomImage = entity.roomImage;
                    room.hasCamera = entity.hasCamera;
                    room.isDeleted = entity.isDeleted;
                }
                else
                {
                    var existingRoomHistory = await context.RoomHistories
                        .Where(rh => rh.RoomId == room.roomId && rh.CheckOutDate == DateTime.MinValue)
                        .FirstOrDefaultAsync();

                    if (room.isDeleted != entity.isDeleted && existingRoomHistory != null)
                    {
                        existingRoomHistory.Status = entity.isDeleted ? "Soft Deleted" : "Not In Use"; 
                        existingRoomHistory.CheckOutDate = DateTime.Now; 
                        context.RoomHistories.Update(existingRoomHistory);
                        await context.SaveChangesAsync();
                    }

                    room.isDeleted = entity.isDeleted;
                    room.roomTypeId = entity.roomTypeId;
                    room.description = entity.description;
                    room.status = entity.status;
                    room.roomImage = entity.roomImage;
                    room.hasCamera = entity.hasCamera;
                }

                if (entity.isDeleted == false)
                {
                    var roomType = await context.RoomType.FindAsync(entity.roomTypeId);
                    if (roomType != null && roomType.isDeleted == true)
                    {
                        roomType.isDeleted = false;
                        context.RoomType.Update(roomType);
                        await context.SaveChangesAsync();
                    }
                }

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
