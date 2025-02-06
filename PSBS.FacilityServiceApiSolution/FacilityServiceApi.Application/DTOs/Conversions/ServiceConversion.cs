using FacilityServiceApi.Domain.Entities;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public static class ServiceConversion
    {
        public static Service ToEntity(ServiceDTO service)
        {
            return new Service()
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = service.serviceTypeId,
                serviceDescription = service.serviceDescription,
                serviceName = service.serviceName,
                isDeleted = service.isDeleted,
                serviceImage = service.serviceImage,
                createAt = service.createAt,
                updateAt = service.updateAt,
                ServiceType = service.ServiceType,
            };
        }

        public static Service ToEntity(CreateServiceDTO service, string imagePath)
        {
            return new Service()
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = service.serviceTypeId,
                serviceDescription = service.serviceDescription,
                serviceName = service.serviceName,
                isDeleted = true,
                serviceImage = imagePath,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
        }

        public static Service ToEntity(UpdateServiceDTO service, string imagePath)
        {
            return new Service()
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = service.serviceTypeId,
                serviceDescription = service.serviceDescription,
                serviceName = service.serviceName,
                isDeleted = service.isDeleted,
                serviceImage = imagePath,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
        }


        public static (ServiceDTO?, IEnumerable<ServiceDTO>?) FromEntity(Service? service, IEnumerable<Service>? services)
        {
            //return single
            if (service is not null && services is null)
            {
                var singleservice = new ServiceDTO
                {
                    serviceId = service.serviceId,
                    serviceTypeId = service.serviceTypeId,
                    serviceDescription = service.serviceDescription,
                    serviceName = service.serviceName,
                    serviceImage = service.serviceImage,
                    createAt = service.createAt,
                    updateAt = service.updateAt,
                    ServiceType = service.ServiceType,
                    isDeleted = service.isDeleted
                };
                return (singleservice, null);
            }

            //return list
            if (services is not null && service is null)
            {
                var _services = services.Select(p => new ServiceDTO
                {
                    serviceId = p.serviceId,
                    serviceTypeId = p.serviceTypeId,
                    serviceDescription = p.serviceDescription,
                    serviceName = p.serviceName,
                    serviceImage = p.serviceImage,
                    createAt = p.createAt,
                    updateAt = p.updateAt,
                    ServiceType = p.ServiceType,
                    isDeleted = p.isDeleted
                }).ToList();

                return (null, _services);
            }

            return (null, null);
        }
    }
}
