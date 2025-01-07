using FacilityServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface IServiceType : IGenericInterface<ServiceType>
    {
        Task<IEnumerable<ServiceType>> ListAvailableServiceTypeAsync();
    }
}
