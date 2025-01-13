using FacilityServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IService : IGenericInterface<Service>
    {
        Task<Response> DeleteSecondAsync(Service entity);
    }
}
