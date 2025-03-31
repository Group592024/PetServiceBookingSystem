
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Domain.Entities;


namespace PSPS.AccountAPI.Application.Interfaces
{
    public interface IEmail
    {
        Task SendMail(MailContent mailContent);
        Task SendEmailAsync(string email, string subject, string message);
        Task SendNotificationEmail(Account account, NotificationMessage notificationMessage);
        Task SendHealthBookReminder(Account account, HealthBookMessageDTO healthBookMessage);
    }
}
