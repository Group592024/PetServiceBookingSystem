using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Domain.Entities;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IReport
    {
        Task<IEnumerable<RoomStatusDTO>> GetRoomStatusList();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomTypeQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetServiceQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<PetCountDTO>> GetAllBookingByPet(Guid id,
            int? year, int? month, DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<Room>> ListActiveRoomsAsync();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetActiveRoomTypeList();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetActiveServiceTypeList();
    }
}
