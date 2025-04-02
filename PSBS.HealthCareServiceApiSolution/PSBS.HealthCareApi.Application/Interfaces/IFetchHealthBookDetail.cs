

using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Domain;

namespace PSBS.HealthCareApi.Application.Interfaces
{
  public  interface IFetchHealthBookDetail
    {
        Task<IEnumerable<HealthBookMessageDTO>> FetchHealthBookDetailList(IEnumerable<PetHealthBook> healthBooks);
    }
}
