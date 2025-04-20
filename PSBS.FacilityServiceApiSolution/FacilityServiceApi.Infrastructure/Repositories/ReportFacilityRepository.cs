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

        public bool CheckRoomHistoryByDate(RoomHistory history, DateTime? start, DateTime? end)
        {
            if (history.CheckInDate == null || history.CheckOutDate == null || !start.HasValue || !end.HasValue)
                return false;

            return history.CheckOutDate >= start && history.CheckInDate <= end;
        }

        public bool CheckRoomHistoryByMonth(RoomHistory history, int? year, int? month)
        {
            if (history.CheckInDate == null || history.CheckOutDate == null || !year.HasValue || !month.HasValue)
                return false;

            var checkIn = history.CheckInDate.Value;
            var checkOut = history.CheckOutDate.Value;

            // If booking spans the same year
            if (checkIn.Year == checkOut.Year && year == checkIn.Year)
                return month >= checkIn.Month && month <= checkOut.Month;

            // Booking spans different years
            if (year == checkIn.Year && month >= checkIn.Month)
                return true;

            if (year == checkOut.Year && month <= checkOut.Month)
                return true;

            return false;
        }

        public bool CheckRoomHistoryByYear(RoomHistory history, int? year)
        {
            if (history.CheckInDate == null || history.CheckOutDate == null || !year.HasValue)
                return false;

            return year == history.CheckInDate.Value.Year || year == history.CheckOutDate.Value.Year;
        }

        private int CalculateDays(RoomHistory history, DateTime? periodStart = null, DateTime? periodEnd = null)
        {
            Console.WriteLine("do ne");

            if (history.CheckInDate == null || history.CheckOutDate == null)
                return 0;

            var checkIn = history.CheckInDate.Value;
            var checkOut = history.CheckOutDate.Value;

            var effectiveStart = periodStart.HasValue && periodStart.Value > checkIn ? periodStart.Value : checkIn;
            var effectiveEnd = periodEnd.HasValue && periodEnd.Value < checkOut ? periodEnd.Value : checkOut;

            if (effectiveEnd < effectiveStart)
                return 0;

            var totalHours = (effectiveEnd - effectiveStart).TotalHours;
            Console.WriteLine("ngay ne" + (int)Math.Ceiling(totalHours > 0 ? totalHours / 24 : 1));
            return (int)Math.Ceiling(totalHours > 0 ? totalHours / 24 : 1);
        }


        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomHistotyQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var rooms = await context.Room.Include(r => r.RoomHistories)
                                          .Include(r => r.RoomType)
                                          .ToListAsync();

            var result = new List<RoomHistoryQuantityDTO>();

            foreach (var room in rooms)
            {
                IEnumerable<RoomHistory> matchedHistories = room.RoomHistories ?? Enumerable.Empty<RoomHistory>();

                var income = matchedHistories.Sum(h =>
                {
                    DateTime? periodStart = null;
                    DateTime? periodEnd = null;

                    if (startDate.HasValue && endDate.HasValue)
                    {
                        periodStart = startDate;
                        periodEnd = endDate;
                    }
                    else if (year.HasValue && month.HasValue)
                    {
                        periodStart = new DateTime(year.Value, month.Value, 1);
                        periodEnd = periodStart.Value.AddMonths(1).AddDays(-1);
                    }
                    else if (year.HasValue)
                    {
                        periodStart = new DateTime(year.Value, 1, 1);
                        periodEnd = new DateTime(year.Value, 12, 31);
                    }
                    Console.WriteLine("calcu" + CalculateDays(h, periodStart, periodEnd));

                    return h.Room.RoomType.price * CalculateDays(h, periodStart, periodEnd);
                });

                if (startDate.HasValue && endDate.HasValue)
                    matchedHistories = matchedHistories.Where(h => CheckRoomHistoryByDate(h, startDate, endDate));
                else if (month.HasValue)
                    matchedHistories = matchedHistories.Where(h => CheckRoomHistoryByMonth(h, year, month));
                else if (year.HasValue)
                    matchedHistories = matchedHistories.Where(h => CheckRoomHistoryByYear(h, year));
                var quantity = matchedHistories.Count();


                result.Add(new RoomHistoryQuantityDTO(room.RoomType.name, quantity, income));
            }

            return result;
        }

        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetRoomTypeQuantity(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            var roomHistories = await GetRoomHistotyQuantity(year, month, startDate, endDate);

            var grouped = roomHistories
                .GroupBy(r => r.roomTypeName)
                .Select(g => new RoomHistoryQuantityDTO(g.Key, g.Sum(x => x.quantity), g.Sum(x => x.income)))
                .ToList();

            return grouped;
        }


        public async Task<IEnumerable<RoomHistoryQuantityDTO>> GetServiceQuantity(List<Guid> BookingIds)
        {
            Console.WriteLine("Response nhan duoc ne: " + BookingIds.Count());
            var bookingServiceItemsQuery = context.bookingServiceItems
                 .Where(b => BookingIds.Contains(b.BookingId))
                .Include(b => b.ServiceVariant)
                    .ThenInclude(v => v.Service)
                   ;

            Console.WriteLine(" So Booking ne: " + bookingServiceItemsQuery.Count());

            // Group by service name
            var groupedData = await bookingServiceItemsQuery
                .GroupBy(p => p.ServiceVariant.Service.serviceName)
                .Select(g => new RoomHistoryQuantityDTO
                (
                    g.Key,
                    g.Count(),
                    g.Sum(x => x.Price)
                ))
                .ToListAsync();

            return groupedData;
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
            var roomTypes = await context.RoomType.Include(p => p.Rooms).Where(m => !m.isDeleted).ToListAsync();

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
            var roomTypes = await context.ServiceType.Include(p => p.Services).Where(m => !m.isDeleted).ToListAsync();

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


