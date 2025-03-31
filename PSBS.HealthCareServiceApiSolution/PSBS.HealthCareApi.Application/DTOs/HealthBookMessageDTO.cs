
namespace PSBS.HealthCareApi.Application.DTOs
{
   public class HealthBookMessageDTO
    {
     public Guid UserId { get; set; }
     public DateTime visitDate {  get; set; }
     public DateTime nextVisitDate { get; set; }
     public string bookingCode { get; set; } = string.Empty;
     public string PetName { get; set; } = string.Empty ;

    }
}
