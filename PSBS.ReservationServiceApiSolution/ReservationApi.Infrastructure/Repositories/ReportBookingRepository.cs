using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.PSBSLogs;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;

namespace ReservationApi.Infrastructure.Repositories
{
    public class ReportBookingRepository(ReservationServiceDBContext context) : IReport
    {
        //return list booking status include bookings
        public async Task<IEnumerable<BookingStatus>> GetAllBookingStatusIncludeBookingAsync()
        {
            try
            {
                var bookingStatuses = await context.BookingStatuses.Include(p => p.Bookings).ToListAsync();
                return bookingStatuses;
            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while retrieving booking Status.");
            }
        }

        //return list booking status include bookings
        public async Task<IEnumerable<ReportBookingTypeDTO>> GetTotalIncomeByBookingTypeAsync(
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var types = await context.BookingTypes.ToListAsync();
                List<ReportBookingTypeDTO> result = new List<ReportBookingTypeDTO>();

                foreach (var type in types)
                {
                    var bookings = await context.Bookings.Where(p => p.BookingTypeId == type.BookingTypeId
                    && p.isPaid == true).ToListAsync();

                    var finalBookings = bookings;

                    if (startDate.HasValue && endDate.HasValue)
                    {
                        finalBookings = bookings.Where(p => p.BookingDate >= startDate
                        && p.BookingDate <= endDate).ToList();

                        Console.WriteLine("So booking"+finalBookings.Count);

                    }
                    else if (month.HasValue)
                    {
                        finalBookings = bookings.Where(p => p.BookingDate.Month == month
                        && p.BookingDate.Year == year).ToList();
                    }
                    else
                    {
                        finalBookings = bookings.Where(p => p.BookingDate.Year == year).ToList();
                    }
                    var amountDTOs = await HandleAmountDTO(finalBookings, year, month, startDate, endDate);
                    result.Add(new ReportBookingTypeDTO(type.BookingTypeName, amountDTOs));
                }

                return result;

            }
            catch (Exception ex)
            {
                // Log the original exception
                LogExceptions.LogException(ex);
                // Display a client-friendly error message
                throw new Exception("Error occurred while get total income of bookings");
            }
        }

        public async Task<List<AmountDTO>> HandleAmountDTO(List<Booking> bookings, int? year, int? month,
            DateTime? startDate, DateTime? endDate)
        {
            if (startDate.HasValue && endDate.HasValue)
            {
                var allDays = Enumerable.Range(0, ((endDate ?? DateTime.Now) - (startDate ?? DateTime.Now)).Days + 1)
                    .Select(p => (startDate ?? DateTime.Now).AddDays(p)).ToList();

                var response = bookings.GroupBy(p => p.BookingDate.Date)
                    .Select(s => new
                    {
                        Date = s.Key,
                        TotalAmount = s.Sum(m => m.TotalAmount)
                    }).ToList();

                    Console.WriteLine("response ne nhe: "+response.ToString());

                var result = allDays.Select(p => new AmountDTO(
                    p.ToString("yyyy/MM/dd"),
                    response.FirstOrDefault(n => n.Date == p)?.TotalAmount ?? 0
                    )).ToList();
                return result;
            }
            else if (month.HasValue)
            {
                var allMonths = Enumerable.Range(1, DateTime.DaysInMonth(year ?? DateTime.Now.Year,
                    month ?? DateTime.Now.Month));

                Console.WriteLine("co vo day ne");

                var response = bookings.GroupBy(p => p.BookingDate.Day)
                    .Select(s => new
                    {
                        Date = s.Key,
                        TotalAmmount = s.Sum(m => m.TotalAmount)
                    }).ToList();

                var result = allMonths.Select(p => new AmountDTO(
                    p.ToString(), response.FirstOrDefault(s => s.Date == p)?.TotalAmmount ?? 0
                    )).ToList();
                return result;
            }
            else
            {
                var allYear = Enumerable.Range(1, 12);

                var response = bookings.GroupBy(p => p.BookingDate.Month)
                    .Select(s => new
                    {
                        Date = s.Key,
                        TotalAmmount = s.Sum(m => m.TotalAmount)
                    }).ToList();

                var result = allYear.Select(p => new AmountDTO(
                    p.ToString(), response.FirstOrDefault(s => s.Date == p)?.TotalAmmount ?? 0
                    )).ToList();
                return result;
            }

        }

    }
}
