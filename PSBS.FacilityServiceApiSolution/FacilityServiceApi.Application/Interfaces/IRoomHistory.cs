using FacilityServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IRoomHistory
    {
        Task<Response> CreateAsync(RoomHistory entity);
        Task<Response> UpdateAsync(RoomHistory entity);
        Task<IEnumerable<RoomHistory>> GetAllAsync();
        Task<IEnumerable<RoomHistory>> GetRoomHistoryByBookingId(Guid id);
        Task<RoomHistory> GetByIdAsync(Guid id);
        Task<Response> UpdateCameraAsync(Guid roomHistoryId, Guid cameraId);
        Task<Response> CheckoutRoomHistory(Guid roomHistoryId);
    }
}
