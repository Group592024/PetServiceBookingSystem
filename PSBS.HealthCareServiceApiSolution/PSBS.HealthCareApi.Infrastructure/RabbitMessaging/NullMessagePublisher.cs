

using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.Responses;

namespace PSBS.HealthCareApi.Infrastructure.RabbitMessaging
{
    public class NullMessagePublisher : IHealthBookPublisher
    {
        public Task<Response> PublishHealthCareBookAsync(IEnumerable<PetHealthBook> healthBooks)
        {
            return Task.FromResult(new Response
            {
                Flag = false,
                Message = "RabbitMQ is not available. Message not published."
            });
        }
    }
}
