using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class ReportFacilityRepository(FacilityServiceDbContext context) : IReport
    {
        public async Task<IEnumerable<RoomStatusDTO>> GetRoomStatusList()
        {
            var rooms = await context.Room.Where(p => !p.isDeleted).ToListAsync();

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

        public async Task<IEnumerable<PetCountDTO>> GetAllBookingByPet(Guid id)
        {
            try
            {
                var serviceVariants = await context.ServiceVariant.Where(p => p.serviceId == id
                && !p.isDeleted).ToListAsync();

                List<BookingPetDTO> result = new List<BookingPetDTO>();

                foreach (var serviceVariant in serviceVariants)
                {
                    var bookingPetDtos = await context.bookingServiceItems
                        .Where(p => p.ServiceVariantId == serviceVariant.serviceVariantId)
                        .Select(s => new BookingPetDTO(s.BookingId, s.PetId)).ToListAsync();

                    result.AddRange(bookingPetDtos);
                }

                var response = result.GroupBy(p => p.petId)
                        .Select(s => new PetCountDTO(s.Key, s.Count())).ToList();

                return response;
            }
            catch (Exception ex)
            {
                LogExceptions.LogException(ex);
                throw new Exception("Error occurred retrieving bookings by oet");
            }
        }

        public async Task<IEnumerable<Room>> ListActiveRoomsAsync()
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
        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetActiveRoomTypeList()
        {
            var roomTypes = await context.RoomType.Include(p => p.Rooms).ToListAsync();

            List<RoomHistoryQuantityDTO> result = new List<RoomHistoryQuantityDTO>();

            foreach (var roomType in roomTypes)
            {
                var quantity = roomType.Rooms.Where(p => !p.isDeleted)?.Count() ?? 0;
                Console.WriteLine("Day la quantity" + quantity.ToString());
                result.Add(new RoomHistoryQuantityDTO(roomType.name, quantity));
            }

            return result;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetActiveServiceTypeList()
        {
            var roomTypes = await context.ServiceType.Include(p => p.Services).ToListAsync();

            List<RoomHistoryQuantityDTO> result = new List<RoomHistoryQuantityDTO>();

            foreach (var roomType in roomTypes)
            {
                var quantity = roomType.Services.Where(p => !p.isDeleted)?.Count() ?? 0;
                Console.WriteLine("Day la quantity" + quantity.ToString());
                result.Add(new RoomHistoryQuantityDTO(roomType.typeName, quantity));
            }

            return result;
        }

    }
}


