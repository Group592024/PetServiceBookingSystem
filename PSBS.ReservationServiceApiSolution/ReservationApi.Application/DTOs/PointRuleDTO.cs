

using System.ComponentModel.DataAnnotations;

namespace ReservationApi.Application.DTOs
{
    public record PointRuleDTO(
        Guid PointRuleId,
        [Required, Range(0, int.MaxValue)] int PointRuleRatio,
         [Required]  bool isDeleted
        );
}
