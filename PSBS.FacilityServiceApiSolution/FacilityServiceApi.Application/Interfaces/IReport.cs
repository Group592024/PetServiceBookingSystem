using FacilityServiceApi.Application.DTOs;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IReport
    {
        Task<IEnumerable<RoomStatusDTO>> GetRoomStatusList();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomTypeQuantity();
        Task<IEnumerable<RoomHistoryQuantityDTO>> GetServiceQuantity();
        Task<IEnumerable<PetCountDTO>> GetAllBookingByPet(Guid id);
    }
}
