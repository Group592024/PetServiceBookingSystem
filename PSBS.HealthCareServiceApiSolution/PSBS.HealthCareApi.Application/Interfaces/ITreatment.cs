using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.Interface;

namespace PSBS.HealthCareApi.Application.Interfaces
{
    public interface ITreatment : IGenericInterface<Treatment>
    {
        Task<IEnumerable<Treatment>> ListAvailableTreatmentAsync();
    }
}
