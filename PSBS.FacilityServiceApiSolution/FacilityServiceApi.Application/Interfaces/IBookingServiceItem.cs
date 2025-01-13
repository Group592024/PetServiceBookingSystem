using FacilityServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IBookingServiceItem : IGenericInterface<BookingServiceItem>
    {
        Task<bool> CheckIfVariantHasBooking(Guid serviceVariantId);
    }
}
