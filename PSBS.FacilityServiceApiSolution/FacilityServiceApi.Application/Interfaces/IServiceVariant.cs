using FacilityServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IServiceVariant : IGenericInterface<ServiceVariant>
    {
        Task<IEnumerable<ServiceVariant>> GetAllVariantsAsync(Guid id);
        Task<Response> DeleteSecondAsync(ServiceVariant entity);
        Task<bool> CheckIfServiceHasVariant(Guid serviceId);
        Task<Response> DeleteByServiceIdAsync(Guid serviceId);
        Task<bool> CheckIfVariantInBooking(Guid serviceVariantId);
    }
}
