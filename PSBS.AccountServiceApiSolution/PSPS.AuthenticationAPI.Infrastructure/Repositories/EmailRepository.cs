using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.AccountAPI.Domain.Entities;


namespace PSPS.AccountAPI.Infrastructure.Repositories
{
    public class EmailRepository : IEmail
    {
        private readonly IConfiguration _configuration;
        private readonly EmailSetting mailSettings;
        private readonly ILogger<EmailRepository> logger;

        public EmailRepository(IOptions<EmailSetting> _mailSettings, ILogger<EmailRepository> _logger)
        {
            mailSettings = _mailSettings.Value;
            logger = _logger;
            logger.LogInformation("Create SendMailService");
        }

        public async Task SendMail(MailContent mailContent)
        {
            var email = new MimeMessage();
            email.Sender = new MailboxAddress(mailSettings.DisplayName, mailSettings.Mail);
            email.From.Add(new MailboxAddress(mailSettings.DisplayName, mailSettings.Mail));
            email.To.Add(MailboxAddress.Parse(mailContent.To));
            email.Subject = mailContent.Subject;

            var builder = new BodyBuilder { HtmlBody = mailContent.Body };
            email.Body = builder.ToMessageBody();

            using var smtp = new MailKit.Net.Smtp.SmtpClient();
            try
            {
                await smtp.ConnectAsync(mailSettings.Host, mailSettings.Port, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(mailSettings.Mail, mailSettings.Password);
                await smtp.SendAsync(email);

                logger.LogInformation($"Email sent successfully to {mailContent.To}");
            }
            catch (Exception ex)
            {
                var emailsavefile = $"mailssave/{Guid.NewGuid()}.eml";
                System.IO.Directory.CreateDirectory("mailssave");
                await email.WriteToAsync(emailsavefile);

                logger.LogError($"Lỗi gửi mail: {ex.Message}\nStackTrace: {ex.StackTrace}");
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }
        }
        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            await SendMail(new MailContent()
            {
                To = email,
                Subject = subject,
                Body = htmlMessage
            });
        }
    }
}
