using FacilityServiceApi.Domain.Entities;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public static class ServiceVariantConversion
    {
        public static ServiceVariant ToEntity(CreateServiceVariantDTO serviceVariantDto)
        {
            return new ServiceVariant()
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = serviceVariantDto.serviceId,
                servicePrice = serviceVariantDto.servicePrice,
                serviceContent = serviceVariantDto.serviceContent,
                isDeleted = false,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
        }

        public static ServiceVariant ToEntity(UpdateServiceVariantDTO dto)
        {
            return new ServiceVariant()
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = Guid.NewGuid(),
                servicePrice = dto.servicePrice,
                serviceContent = dto.serviceContent,
                isDeleted = dto.isDeleted,
                createAt = DateTime.Now,
                updateAt = DateTime.Now
            };
        }

        public static (ServiceVariantDTO?, IEnumerable<ServiceVariantDTO>?) FromEntity(ServiceVariant? serviceVariant, IEnumerable<ServiceVariant>? serviceVariants)
        {
            //return single
            if (serviceVariant is not null && serviceVariants is null)
            {
                var singleServiceVariant = new ServiceVariantDTO
                {
                    serviceVariantId = serviceVariant.serviceVariantId,
                    serviceId = serviceVariant.serviceId,
                    servicePrice = serviceVariant.servicePrice,
                    serviceContent = serviceVariant.serviceContent,
                    createAt = serviceVariant.createAt,
                    updateAt = serviceVariant.updateAt,
                    isDeleted = serviceVariant.isDeleted,

                };
                return (singleServiceVariant, null);
            }

            //return list
            if (serviceVariants is not null && serviceVariant is null)
            {
                var _serviceVariants = serviceVariants.Select(p => new ServiceVariantDTO
                {
                    serviceVariantId = p.serviceVariantId,
                    serviceId = p.serviceId,
                    servicePrice = p.servicePrice,
                    serviceContent = p.serviceContent,
                    createAt = p.createAt,
                    updateAt = p.updateAt,
                    isDeleted = p.isDeleted,
                }).ToList();

                return (null, _serviceVariants);
            }

            return (null, null);
        }
    }
}
