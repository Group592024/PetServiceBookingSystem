﻿
using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.Interfaces
{
    public interface IMedicine : IGenericInterface<Medicine>
    {
        Task<IEnumerable<Medicine>> GetAllAttributeAsync();
    }
}
