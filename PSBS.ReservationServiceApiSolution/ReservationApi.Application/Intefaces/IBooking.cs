using PSPS.SharedLibrary.Interface;

using PSPS.SharedLibrary.Responses;

using ReservationApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.Intefaces
{
    public interface IBooking : IGenericInterface<Booking>
    {

        Task<IEnumerable<Booking>> GetAllBookingForUserAsync(Guid id);
        Task<Booking> GetBookingByBookingCodeAsync(String code);
        Task<Response> CancelBookingAsync(Guid bookingId);

    }
}
