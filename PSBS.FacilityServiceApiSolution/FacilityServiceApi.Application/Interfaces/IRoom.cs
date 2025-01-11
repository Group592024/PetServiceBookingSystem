using FacilityServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;


namespace FacilityServiceApi.Application.Interfaces
{
    public interface IRoom : IGenericInterface<Room>
    {
        Task<IEnumerable<Room>> ListAvailableRoomsAsync();

        Task<Room> GetRoomDetailsAsync(Guid roomId);

    }
}
