using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class ReportFacilityRepository(FacilityServiceDbContext context) : IReport
    {
        public async Task<IEnumerable<RoomStatusDTO>> GetRoomStatusList()
        {
            var rooms = await context.Room.ToListAsync();

            var response = rooms.GroupBy(p => p.status)
                .Select(s => new RoomStatusDTO(s.Key, s.Count()));

            return response;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomHistotyQuantity()
        {
            var rooms = await context.Room.Include(p => p.RoomHistories).Include(s => s.RoomType).ToListAsync();

            List<RoomHistoryQuantityDTO> result = new List<RoomHistoryQuantityDTO>();

            foreach (var room in rooms)
            {
                var quantity = room.RoomHistories?.Count() ?? 0;
                Console.WriteLine("Day la quantity" + quantity.ToString());
                result.Add(new RoomHistoryQuantityDTO(room.RoomType.name, quantity));
            }

            return result;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomTypeQuantity()
        {
            var roomHistories = await GetRoomHistotyQuantity();

            Console.WriteLine("Day la roomHistories" + roomHistories.Count());


            var response = roomHistories.GroupBy(p => p.roomTypeName)
                .Select(s => new RoomHistoryQuantityDTO(s.Key, s.Sum(m => m.quantity))).ToList();

            Console.WriteLine("Day la response" + response.Count());


            return response ?? new List<RoomHistoryQuantityDTO>();
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetBookingServiceItemQuantity()
        {
            var rooms = await context.ServiceVariant.Include(p => p.BookingServiceItems)
                .Include(s => s.Service).ToListAsync();

            List<RoomHistoryQuantityDTO> result = new List<RoomHistoryQuantityDTO>();

            foreach (var room in rooms)
            {
                var quantity = room.BookingServiceItems?.Count() ?? 0;
                Console.WriteLine("Day la quantity" + quantity.ToString());
                result.Add(new RoomHistoryQuantityDTO(room.Service.serviceName, quantity));
            }

            return result;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetServiceQuantity()
        {
            var roomHistories = await GetBookingServiceItemQuantity();

            Console.WriteLine("Day la roomHistories" + roomHistories.Count());


            var response = roomHistories.GroupBy(p => p.roomTypeName)
                .Select(s => new RoomHistoryQuantityDTO(s.Key, s.Sum(m => m.quantity))).ToList();

            Console.WriteLine("Day la response" + response.Count());


            return response ?? new List<RoomHistoryQuantityDTO>();
        }
    }
}


