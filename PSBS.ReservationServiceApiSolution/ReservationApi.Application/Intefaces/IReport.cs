using ReservationApi.Application.DTOs;
using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.Intefaces
{
    public interface IReport
    {
        Task<IEnumerable<AccountAmountDTO>> GetIncomeEachCustomer(
     int? year, int? month, DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<BookingStatus>> GetAllBookingStatusIncludeBookingAsync();
        Task<IEnumerable<ReportBookingTypeDTO>> GetTotalIncomeByBookingTypeAsync(
            int? year, int? month, DateTime? startDate, DateTime? endDate);
        Task<PaidBookingIdsDTO> GetPaidBookingIds(int? year, int? month, DateTime? startDate, DateTime? endDate);

    }
}
