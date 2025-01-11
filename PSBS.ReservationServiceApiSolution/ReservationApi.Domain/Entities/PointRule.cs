

using System.ComponentModel.DataAnnotations.Schema;

namespace ReservationApi.Domain.Entities
{
    public class PointRule
    {
        [Column("pointRule_Id")]
        public Guid PointRuleId { get; set; }
        [Column("pointRuleRatio")]
        public int PointRuleRatio { get; set; }
        public bool isDeleted { get; set; }
        public virtual ICollection<Booking>? Bookings { get; set; }
    }
}
