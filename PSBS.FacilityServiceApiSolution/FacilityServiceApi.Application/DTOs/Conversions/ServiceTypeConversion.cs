using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public class ServiceTypeConversion
    {
        public static ServiceType ToEntity(ServiceTypeDTO serviceType)
        {
            return new ServiceType()
            {
                serviceTypeId = serviceType.serviceTypeId,
                typeName = serviceType.typeName,
                description = serviceType.description,
                createAt = serviceType.createAt ?? DateTime.UtcNow,
                updateAt = serviceType.updateAt,
                isDeleted = serviceType.isDeleted ?? false
            };
        }

        public static (ServiceTypeDTO?, IEnumerable<ServiceTypeDTO>?) FromEntity(ServiceType? serviceType, IEnumerable<ServiceType>? serviceTypes)
        {
            if (serviceType is not null && serviceTypes is null)
            {
                var singleServiceType = new ServiceTypeDTO
                {
                    serviceTypeId= serviceType.serviceTypeId,
                    typeName= serviceType.typeName,
                    description= serviceType.description,
                    createAt = serviceType.createAt,
                    updateAt = serviceType.updateAt,
                    isDeleted = serviceType.isDeleted
                };
                return (singleServiceType, null);
            }

            if (serviceTypes is not null && serviceType is null)
            {
                var _serviceTypes = serviceTypes.Select(st => new ServiceTypeDTO
                {
                    serviceTypeId = st.serviceTypeId,
                    typeName = st.typeName,
                    createAt = st.createAt,
                    updateAt = st.updateAt,
                    description = st.description,
                    isDeleted = st.isDeleted
                }).ToList();

                return (null, _serviceTypes);
            }

            return (null, null);
        }
    }
}
