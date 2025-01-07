

using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.DTOs.Conversions
{
    public class PointRuleConversion
    {
        public static PointRule ToEntity(PointRuleDTO pointRuleDTO) => new()
        {
            PointRuleId = pointRuleDTO.PointRuleId,
            PointRuleRatio = pointRuleDTO.PointRuleRatio,
            isDeleted = false

        };

        public static (PointRuleDTO?, IEnumerable<PointRuleDTO>?) FromEntity(PointRule pointRule, IEnumerable<PointRule> pointRules)
        {
            if(pointRule is not null || pointRules is null){
                var singlePointRule = new PointRuleDTO(
                    pointRule!.PointRuleId,
                    pointRule.PointRuleRatio,
                    pointRule.isDeleted
                    );
                return (singlePointRule, null);
            }
            if (pointRule is null || pointRules is not null) {
            var list = pointRules!.Select(p=> new PointRuleDTO(
                p.PointRuleId,
                p.PointRuleRatio,
                p.isDeleted
                )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
