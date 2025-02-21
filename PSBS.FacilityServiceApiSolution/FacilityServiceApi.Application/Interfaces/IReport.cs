using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Domain.Entities;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IReport
    {
        Task<IEnumerable<RoomStatusDTO>> GetRoomStatusList();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomTypeQuantity();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetServiceQuantity();
        Task<IEnumerable<PetCountDTO>> GetAllBookingByPet(Guid id);
        Task<IEnumerable<Room>> ListActiveRoomsAsync();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetActiveRoomTypeList();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetActiveServiceTypeList();
    }
}
