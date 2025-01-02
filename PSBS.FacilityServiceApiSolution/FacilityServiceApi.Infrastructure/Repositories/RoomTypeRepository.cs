using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class RoomTypeRepository : IRoomType
    {
        private readonly FacilityServiceDbContext _context;

        public RoomTypeRepository(FacilityServiceDbContext context)
        {
            _context = context;
        }

        public async Task<Response> CreateAsync(RoomType entity)
        {
            try
            {
                _context.RoomType.Add(entity);
                await _context.SaveChangesAsync();
                return new Response(Flag: true, Message: "RoomType created successfully");
            }
            catch (Exception ex)
            {
                return new Response(Flag: false, Message: $"Error: {ex.Message}");
            }
        }

        public async Task<Response> DeleteAsync(RoomType entity)
        {
            try
            {
                var roomType = await _context.RoomType.FirstOrDefaultAsync(r => r.roomTypeId == entity.roomTypeId && r.isDeleted == false);
                if (roomType != null)
                {
                    roomType.isDeleted = true; 
                    await _context.SaveChangesAsync();
                    return new Response(Flag: true, Message: "RoomType soft deleted successfully");
                }
                return new Response(Flag: false, Message: "RoomType not found or already deleted");
            }
            catch (Exception ex)
            {
                return new Response(Flag: false, Message: $"Error: {ex.Message}");
            }
        }

        public async Task<IEnumerable<RoomType>> GetAllAsync()
        {
            try
            {
                return await _context.RoomType.Where(r => r.isDeleted == false).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error occurred retrieving RoomTypes: {ex.Message}");
            }
        }

        public async Task<RoomType> GetByIdAsync(Guid id)
        {
            try
            {
                return await _context.RoomType
                    .FirstOrDefaultAsync(r => r.roomTypeId == id && r.isDeleted == false);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error occurred retrieving RoomType by Id: {ex.Message}");
            }
        }

        public async Task<RoomType> GetByAsync(Expression<Func<RoomType, bool>> predicate)
        {
            try
            {
                return await _context.RoomType
                    .Where(r => r.isDeleted == false) 
                    .FirstOrDefaultAsync(predicate);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error occurred retrieving RoomType by condition: {ex.Message}");
            }
        }

        public async Task<Response> UpdateAsync(RoomType entity)
        {
            try
            {
                var existingRoomType = await _context.RoomType
                    .FirstOrDefaultAsync(r => r.roomTypeId == entity.roomTypeId && r.isDeleted == false);

                if (existingRoomType == null)
                {
                    return new Response(Flag: false, Message: "RoomType not found or already deleted");
                }

                existingRoomType.name = entity.name;
                existingRoomType.description = entity.description;
                existingRoomType.pricePerHour = entity.pricePerHour;
                existingRoomType.pricePerDay = entity.pricePerDay;

                await _context.SaveChangesAsync();
                return new Response(Flag: true, Message: "RoomType updated successfully");
            }
            catch (Exception ex)
            {
                return new Response(Flag: false, Message: $"Error: {ex.Message}");
            }
        }
    }
}
