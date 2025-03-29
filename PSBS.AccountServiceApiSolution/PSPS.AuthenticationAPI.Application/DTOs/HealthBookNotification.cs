
namespace PSPS.AccountAPI.Application.DTOs
{
    public class HealthBookNotification
    {
        Guid BookingOrder {  get; set; }
        DateTime NextVisitDate { get; set; }
        public string NotificationTitle { get; set; } = string.Empty;
        public string NotificationContent { get; set; } = string.Empty;
    }
}
