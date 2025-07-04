﻿

using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.Responses;

namespace PSBS.HealthCareApi.Application.Interfaces
{
  public  interface IHealthBookPublisher
    {
        Task<Response> PublishHealthCareBookAsync(IEnumerable<HealthBookMessageDTO> healthBooks);
    }
}
