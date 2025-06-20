﻿using Azure;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;

namespace PSBS.HealthCareApi.Application.Interfaces
{
    public interface IPetHealthBook : IGenericInterface<PetHealthBook>
    {
        Task<IEnumerable<PetHealthBook>> GetUpcomingVisitsAsync(int daysBefore = 1);
    }

}