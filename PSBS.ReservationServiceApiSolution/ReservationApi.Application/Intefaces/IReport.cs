using ReservationApi.Application.DTOs;
using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.Intefaces
{
    public interface IReport
    {
        Task<IEnumerable<BookingStatus>> GetAllBookingStatusIncludeBookingAsync();
        Task<IEnumerable<ReportBookingTypeDTO>> GetTotalIncomeByBookingTypeAsync(
            int? year, int? month, DateTime? startDate, DateTime? endDate);
    }
}
