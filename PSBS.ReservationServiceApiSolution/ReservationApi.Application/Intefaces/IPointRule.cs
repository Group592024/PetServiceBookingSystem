

using PSPS.SharedLibrary.Interface;
using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.Intefaces
{
    public interface IPointRule : IGenericInterface<PointRule>
    {
        Task<PointRule> GetPointRuleActiveAsync();
    }
}
