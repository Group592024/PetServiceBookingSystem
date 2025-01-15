using FacilityServiceApi.Application.Interfaces;
using Quartz;

namespace FacilityServiceApi.Application.Jobs
{
    public class DeleteServiceJob : IJob
    {
        private readonly IService _serviceInterface;
        private readonly IServiceVariant _serviceVariantInterface;

        public DeleteServiceJob(IService serviceInterface, IServiceVariant serviceVariantInterface)
        {
            _serviceInterface = serviceInterface;
            _serviceVariantInterface = serviceVariantInterface;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            if (!context.JobDetail.JobDataMap.ContainsKey("ServiceId"))
            {
                Console.WriteLine("JobDataMap does not contain ServiceId.");
                return;
            }

            var serviceId = context.JobDetail.JobDataMap.GetGuid("ServiceId");
            if (serviceId == Guid.Empty)
            {
                Console.WriteLine("ServiceId is not valid.");
                return;
            }

            var serviceVariants = await _serviceVariantInterface.GetAllVariantsAsync(serviceId);
            if (serviceVariants == null) return;

            var service = await _serviceInterface.GetByIdAsync(serviceId);

            if ((serviceVariants == null || !serviceVariants.Any()))
            {
                await _serviceInterface.DeleteSecondAsync(service);
                Console.WriteLine($"Service {serviceId} is deleted permanently automatically!");
            }
            else
            {
                service.isDeleted = false;
                await _serviceInterface.UpdateAsync(service);


                var scheduler = context.Scheduler;
                await scheduler.DeleteJob(context.JobDetail.Key);

                Console.WriteLine($"Service {serviceId} is public now and job is stopped.");
            }
        }
    }
}
