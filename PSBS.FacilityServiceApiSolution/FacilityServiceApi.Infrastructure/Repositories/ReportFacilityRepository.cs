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

        public bool CheckRoomHistoryByDate(RoomHistory roomHistory, DateTime? startDate, DateTime? endDate)
        {
            bool flag = false;
            if (roomHistory.CheckInDate != null && roomHistory.CheckOutDate != null)
            {
                if (roomHistory.CheckInDate >= startDate)
                {
                    if (roomHistory.CheckOutDate <= endDate)
                    {
                        flag = true;
                    }
                }
                else
                {
                    if (roomHistory.CheckOutDate >= startDate)
                    {
                        flag = true;
                    }
                }
            }
            return flag;
        }

        public bool CheckRoomHistoryByMonth(RoomHistory roomHistory, int? year, int? month)
        {
            bool flag = false;
            if (roomHistory.CheckInDate != null && roomHistory.CheckOutDate != null)
            {
                if (roomHistory.CheckInDate.Value.Year == roomHistory.CheckOutDate.Value.Year)
                {
                    if (year == roomHistory.CheckInDate.Value.Year)
                    {
                        if (month >= roomHistory.CheckInDate.Value.Month && month <= roomHistory.CheckOutDate.Value.Month)
                        {
                            flag = true;
                        }
                    }
                }
                else
                {
                    if (year == roomHistory.CheckInDate.Value.Year)
                    {
                        if (month >= roomHistory.CheckInDate.Value.Month)
                        {
                            flag = true;
                        }
                    }

                    if (year == roomHistory.CheckOutDate.Value.Year)
                    {
                        if (month <= roomHistory.CheckOutDate.Value.Month)
                        {
                            flag = true;
                        }
                    }
                }

            }
            return flag;
        }

        public bool CheckRoomHistoryByYear(RoomHistory roomHistory, int? year)
        {
            bool flag = false;
            if (roomHistory.CheckInDate != null && roomHistory.CheckOutDate != null)
            {
                if (roomHistory.CheckInDate.Value.Year == roomHistory.CheckOutDate.Value.Year)
                {
                    if (year == roomHistory.CheckInDate.Value.Year)
                    {
                        flag = true;
                    }
                }
                else
                {
                    if (year == roomHistory.CheckInDate.Value.Year ||
                        year == roomHistory.CheckOutDate.Value.Year)
                    {
                        flag = true;
                    }
                }

            }
            return flag;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomHistotyQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var rooms = await context.Room.Include(p => p.RoomHistories).Include(s => s.RoomType).ToListAsync();

            List<RoomHistoryQuantityDTO> result = new List<RoomHistoryQuantityDTO>();

            foreach (var room in rooms)
            {
                var quantity = 0;
                if (startDate.HasValue && endDate.HasValue)
                {

                    quantity = room.RoomHistories?.Where(p => CheckRoomHistoryByDate(p, startDate, endDate)).Count() ?? 0;

                }
                else if (month.HasValue)
                {
                    quantity = room.RoomHistories?.Where(p => CheckRoomHistoryByMonth(p, year, month)).Count() ?? 0;
                }
                else if (year.HasValue)
                {
                    quantity = room.RoomHistories?.Where(p => CheckRoomHistoryByYear(p, year)).Count() ?? 0;
                }
                else
                {
                    quantity = room.RoomHistories?.Count() ?? 0;
                }

                Console.WriteLine("Day la quantity" + quantity.ToString());
                result.Add(new RoomHistoryQuantityDTO(room.RoomType.name, quantity));
            }

            return result;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomTypeQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var roomHistories = await GetRoomHistotyQuantity(year, month, startDate, endDate);

            Console.WriteLine("Day la roomHistories" + roomHistories.Count());


            var response = roomHistories.GroupBy(p => p.roomTypeName)
                .Select(s => new RoomHistoryQuantityDTO(s.Key, s.Sum(m => m.quantity))).ToList();

            Console.WriteLine("Day la response" + response.Count());


            return response ?? new List<RoomHistoryQuantityDTO>();
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetBookingServiceItemQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var variants = await context.ServiceVariant.Include(p => p.BookingServiceItems)
                .Include(s => s.Service).ToListAsync();

            List<RoomHistoryQuantityDTO> result = new List<RoomHistoryQuantityDTO>();

            foreach (var variant in variants)
            {
                var quantity = 0;
                if (startDate.HasValue && endDate.HasValue)
                {
                    quantity = variant.BookingServiceItems?.Where(p => p.CreateAt >= startDate
                        && p.CreateAt <= endDate).Count() ?? 0;

                }
                else if (month.HasValue)
                {
                    quantity = variant.BookingServiceItems?.Where(p => p.CreateAt.Month == month
                        && p.CreateAt.Year == year).Count() ?? 0;
                }
                else if (year.HasValue)
                {
                    quantity = variant.BookingServiceItems?.Where(p => p.CreateAt.Year == year).Count() ?? 0;
                }
                else
                {
                    quantity = variant.BookingServiceItems?.Count() ?? 0;
                }

                Console.WriteLine("Day la quantity" + quantity.ToString());
                result.Add(new RoomHistoryQuantityDTO(variant.Service.serviceName, quantity));
            }

            return result;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetServiceQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var roomHistories = await GetBookingServiceItemQuantity(year, month, startDate, endDate);

            Console.WriteLine("Day la roomHistories" + roomHistories.Count());


            var response = roomHistories.GroupBy(p => p.roomTypeName)
                .Select(s => new RoomHistoryQuantityDTO(s.Key, s.Sum(m => m.quantity))).ToList();

            Console.WriteLine("Day la response" + response.Count());


            return response ?? new List<RoomHistoryQuantityDTO>();
        }

        public async Task<IEnumerable<PetCountDTO>> GetAllBookingByPet(Guid id,
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var serviceVariants = await context.ServiceVariant.Where(p => p.serviceId == id
                && !p.isDeleted).ToListAsync();

                Console.WriteLine("so service variant ne" + serviceVariants.Count());

                List<BookingPetDTO> result = new List<BookingPetDTO>();

                foreach (var serviceVariant in serviceVariants)
                {
                    List<BookingPetDTO> bookingPetDtos = new List<BookingPetDTO>();
                    if (startDate.HasValue && endDate.HasValue)
                    {
                        Console.WriteLine("co startdate enddate ne");

                        bookingPetDtos = await context.bookingServiceItems
                        .Where(p => p.ServiceVariantId == serviceVariant.serviceVariantId &&
                        p.CreateAt >= startDate && p.CreateAt <= endDate)
                        .Select(s => new BookingPetDTO(s.BookingId, s.PetId)).ToListAsync();

                    }
                    else if (month.HasValue)
                    {
                        Console.WriteLine("co thang ne");

                        bookingPetDtos = await context.bookingServiceItems
                        .Where(p => p.ServiceVariantId == serviceVariant.serviceVariantId &&
                        p.CreateAt.Month == month && p.CreateAt.Year == year)
                        .Select(s => new BookingPetDTO(s.BookingId, s.PetId)).ToListAsync();
                    }
                    else if (year.HasValue)
                    {
                        Console.WriteLine("co nam ne" + year);

                        bookingPetDtos = await context.bookingServiceItems
                        .Where(p => p.ServiceVariantId == serviceVariant.serviceVariantId &&
                        p.CreateAt.Year == year)
                        .Select(s => new BookingPetDTO(s.BookingId, s.PetId)).ToListAsync();

                        Console.WriteLine("so bookingPetDtos ne" + bookingPetDtos.Count());

                    }
                    else
                    {
                        bookingPetDtos = await context.bookingServiceItems
                        .Where(p => p.ServiceVariantId == serviceVariant.serviceVariantId)
                        .Select(s => new BookingPetDTO(s.BookingId, s.PetId)).ToListAsync();
                    }

                    result.AddRange(bookingPetDtos);
                }

                var response = result.GroupBy(p => p.petId)
                        .Select(s => new PetCountDTO(s.Key, s.Count())).ToList();

                return response ?? new List<PetCountDTO>();
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


