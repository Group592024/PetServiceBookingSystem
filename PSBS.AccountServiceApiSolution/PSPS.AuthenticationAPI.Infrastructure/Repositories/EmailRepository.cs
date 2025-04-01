using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.AccountAPI.Domain.Entities;


namespace PSPS.AccountAPI.Infrastructure.Repositories
{
    public class EmailRepository : PSPS.AccountAPI.Application.Interfaces.IEmail
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

        public Task SendNotificationEmail(Account account, NotificationMessage notificationMessage)
        {
            string message = $@"<!DOCTYPE html>
<html lang=""en"" xmlns=""http://www.w3.org/1999/xhtml"" xmlns:o=""urn:schemas-microsoft-com:office:office"">
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1"">
  <meta name=""x-apple-disable-message-reformatting"">
  <title>{notificationMessage.NotificationTitle}</title>
  <!--[if mso]>
  <style>
    table {{border-collapse:collapse;border-spacing:0;border:none;margin:0;}}
    div, td {{padding:0;}}
    div {{margin:0 !important;}}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    table, td, div, h1, p {{
      font-family: Arial, sans-serif;
    }}
    .logo-container {{
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
      background-color: #ffffff;
    }}
    .logo-wrapper {{
      display: flex;
      align-items: center;
    }}
    .logo-icon {{
      width: 24px;
      height: 24px;
      margin-right: 10px;
      color: #1e88e5;
    }}
    .logo-text {{
      font-size: 24px;
      font-weight: 700;
      color: #1e88e5;
    }}
    .logo-text span {{
      color: #333;
    }}
    .divider {{
      height: 1px;
      background-color: #e0e0e0;
      margin: 0 30px;
    }}
    @media screen and (max-width: 530px) {{
      .unsub {{
        display: block;
        padding: 8px;
        margin-top: 14px;
        border-radius: 6px;
        background-color: #555555;
        text-decoration: none !important;
        font-weight: bold;
      }}
      .col-lge {{
        max-width: 100% !important;
      }}
      .logo-text {{
        font-size: 20px;
      }}
      .divider {{
        margin: 0 15px;
      }}
    }}
    @media screen and (min-width: 531px) {{
      .col-sml {{
        max-width: 27% !important;
      }}
      .col-lge {{
        max-width: 73% !important;
      }}
    }}
  </style>
</head>
<body style=""margin:0;padding:0;word-spacing:normal;background-color:#f5f7fa;"">
  <div role=""article"" aria-roledescription=""email"" lang=""en"" style=""text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f5f7fa;"">
    <table role=""presentation"" style=""width:100%;border:none;border-spacing:0;"">
      <tr>
        <td align=""center"" style=""padding:0;"">
          <!--[if mso]>
          <table role=""presentation"" align=""center"" style=""width:600px;"">
          <tr>
          <td>
          <![endif]-->
          <table role=""presentation"" style=""width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"">

            <tr>
              <td class=""logo-container"" style=""background-color:#ffffff;text-align:center;"">
                <div class=""logo-wrapper"" style=""display:flex;align-items:center;"">
                  <div class=""logo-icon"">
                    <svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24"" viewBox=""0 0 24 24"" style=""fill: #1e88e5;"">
                      <path d=""M17 14a5 5 0 0 0 2.71-.81L20 13a3.16 3.16 0 0 0 .45-.37l.21-.2a4.48 4.48 0 0 0 .48-.58l.06-.08a4.28 4.28 0 0 0 .41-.76 1.57 1.57 0 0 0 .09-.23 4.21 4.21 0 0 0 .2-.63l.06-.25A5.5 5.5 0 0 0 22 9V2l-3 3h-4l-3-3v7a5 5 0 0 0 5 5zm2-7a1 1 0 1 1-1 1 1 1 0 0 1 1-1zm-4 0a1 1 0 1 1-1 1 1 1 0 0 1 1-1z""></path>
                      <path d=""M11 22v-5H8v5H5V11.9a3.49 3.49 0 0 1-2.48-1.64A3.59 3.59 0 0 1 2 8.5 3.65 3.65 0 0 1 6 5a1.89 1.89 0 0 0 2-2 1 1 0 0 1 1-1 1 1 0 0 1 1 1 3.89 3.89 0 0 1-4 4C4.19 7 4 8.16 4 8.51S4.18 10 6 10h5.09A6 6 0 0 0 19 14.65V22h-3v-5h-2v5z""></path>
                    </svg>
                  </div>
                  <div class=""logo-text"" style=""font-size:24px;font-weight:700;color:#1e88e5;"">
                    <span style=""color:#333;"">Pet</span>Ease
                  </div>
                </div>
              </td>
            </tr>
            <!-- Divider line between header and content -->
            <tr>
              <td class=""divider"" style=""height:1px;background-color:#e0e0e0;margin:0 30px;""></td>
            </tr>
            <tr>
              <td style=""padding:30px;background-color:#ffffff;"">
                <h1 style=""margin-top:0;margin-bottom:16px;font-size:22px;line-height:28px;font-weight:bold;color:#1e88e5;"">Dear {account.AccountName},</h1>
                <p style=""margin:0 0 20px 0;"">{notificationMessage.NotificationContent}</p>
                
                <p style=""margin:20px 0 0 0;"">Best regards,</p>
                <p style=""margin:0;font-weight:bold;color:#1e88e5;"">The PetEase Team</p>
              </td>
            </tr>
            
            <tr>
              <td style=""padding:30px;font-size:24px;line-height:28px;font-weight:bold;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);"">
                <img src=""https://i.pinimg.com/736x/9a/91/b2/9a91b2851d12c82909dc652224918dfc.jpg"" width=""540"" alt=""Pet care illustration"" style=""width:100%;height:auto;border:none;text-decoration:none;color:#363636;"">
              </td>
            </tr>
            
            <tr>
              <td style=""padding:30px;text-align:center;font-size:12px;background-color:#1565c0;color:#ffffff;"">
                <p style=""margin:0 0 5px 0;"">PetEase - Your trusted pet care partner</p>
                <p style=""margin:0;"">© 2024 PetEase. All rights reserved.</p>
              </td>
            </tr>

          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </div>
</body>
</html>";

            // Your email sending implementation here
            string subject = "[PetEase] - " + notificationMessage.NotificationTitle;
            var mail = new MailContent { To = account.AccountEmail, Body = message, Subject = subject };
            return SendMail(mail);
        }

        public Task SendHealthBookReminder(Account account, HealthBookMessageDTO healthBook)
        {
            string message = $@"<!DOCTYPE html>
<html lang=""en"" xmlns=""http://www.w3.org/1999/xhtml"" xmlns:o=""urn:schemas-microsoft-com:office:office"">
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1"">
  <meta name=""x-apple-disable-message-reformatting"">
  <title>Upcoming Pet Visit Reminder</title>
  <!--[if mso]>
  <style>
    table {{border-collapse:collapse;border-spacing:0;border:none;margin:0;}}
    div, td {{padding:0;}}
    div {{margin:0 !important;}}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    table, td, div, h1, p {{
      font-family: Arial, sans-serif;
    }}
    .logo-container {{
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
      background-color: #ffffff;
    }}
    .logo-wrapper {{
      display: flex;
      align-items: center;
    }}
    .logo-icon {{
      width: 24px;
      height: 24px;
      margin-right: 10px;
      color: #1e88e5;
    }}
    .logo-text {{
      font-size: 24px;
      font-weight: 700;
      color: #1e88e5;
    }}
    .logo-text span {{
      color: #333;
    }}
    .divider {{
      height: 1px;
      background-color: #e0e0e0;
      margin: 0 30px;
    }}
    .visit-details {{
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }}
    .detail-row {{
      display: flex;
      margin-bottom: 10px;
    }}
    .detail-label {{
      font-weight: bold;
      width: 150px;
      color: #495057;
    }}
    .detail-value {{
      flex: 1;
      color: #212529;
    }}
    .reminder-note {{
      background-color: #fff3cd;
      color: #856404;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }}
    @media screen and (max-width: 530px) {{
      .unsub {{
        display: block;
        padding: 8px;
        margin-top: 14px;
        border-radius: 6px;
        background-color: #555555;
        text-decoration: none !important;
        font-weight: bold;
      }}
      .col-lge {{
        max-width: 100% !important;
      }}
      .logo-text {{
        font-size: 20px;
      }}
      .divider {{
        margin: 0 15px;
      }}
      .detail-row {{
        flex-direction: column;
      }}
      .detail-label {{
        width: 100%;
        margin-bottom: 5px;
      }}
    }}
    @media screen and (min-width: 531px) {{
      .col-sml {{
        max-width: 27% !important;
      }}
      .col-lge {{
        max-width: 73% !important;
      }}
    }}
  </style>
</head>
<body style=""margin:0;padding:0;word-spacing:normal;background-color:#f5f7fa;"">
  <div role=""article"" aria-roledescription=""email"" lang=""en"" style=""text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f5f7fa;"">
    <table role=""presentation"" style=""width:100%;border:none;border-spacing:0;"">
      <tr>
        <td align=""center"" style=""padding:0;"">
          <!--[if mso]>
          <table role=""presentation"" align=""center"" style=""width:600px;"">
          <tr>
          <td>
          <![endif]-->
          <table role=""presentation"" style=""width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;"">

            <tr>
              <td class=""logo-container"" style=""background-color:#ffffff;text-align:center;"">
                <div class=""logo-wrapper"" style=""display:flex;align-items:center;"">
                  <div class=""logo-icon"">
                    <svg xmlns=""http://www.w3.org/2000/svg"" width=""24"" height=""24"" viewBox=""0 0 24 24"" style=""fill: #1e88e5;"">
                      <path d=""M17 14a5 5 0 0 0 2.71-.81L20 13a3.16 3.16 0 0 0 .45-.37l.21-.2a4.48 4.48 0 0 0 .48-.58l.06-.08a4.28 4.28 0 0 0 .41-.76 1.57 1.57 0 0 0 .09-.23 4.21 4.21 0 0 0 .2-.63l.06-.25A5.5 5.5 0 0 0 22 9V2l-3 3h-4l-3-3v7a5 5 0 0 0 5 5zm2-7a1 1 0 1 1-1 1 1 1 0 0 1 1-1zm-4 0a1 1 0 1 1-1 1 1 1 0 0 1 1-1z""></path>
                      <path d=""M11 22v-5H8v5H5V11.9a3.49 3.49 0 0 1-2.48-1.64A3.59 3.59 0 0 1 2 8.5 3.65 3.65 0 0 1 6 5a1.89 1.89 0 0 0 2-2 1 1 0 0 1 1-1 1 1 0 0 1 1 1 3.89 3.89 0 0 1-4 4C4.19 7 4 8.16 4 8.51S4.18 10 6 10h5.09A6 6 0 0 0 19 14.65V22h-3v-5h-2v5z""></path>
                    </svg>
                  </div>
                  <div class=""logo-text"" style=""font-size:24px;font-weight:700;color:#1e88e5;"">
                    <span style=""color:#333;"">Pet</span>Ease
                  </div>
                </div>
              </td>
            </tr>
            <!-- Divider line between header and content -->
            <tr>
              <td class=""divider"" style=""height:1px;background-color:#e0e0e0;margin:0 30px;""></td>
            </tr>
            <tr>
              <td style=""padding:30px;background-color:#ffffff;"">
                <h1 style=""margin-top:0;margin-bottom:16px;font-size:22px;line-height:28px;font-weight:bold;color:#1e88e5;"">Dear {account.AccountName},</h1>
                <p style=""margin:0 0 20px 0;"">This is a friendly reminder about your pet's upcoming visit:</p>
                
                <div class=""visit-details"">
                    <div class=""detail-row"">
                        <div class=""detail-label"">Pet Name:</div>
                        <div class=""detail-value"">{healthBook.PetName}</div>
                    </div>
                    <div class=""detail-row"">
                        <div class=""detail-label"">Booking Code:</div>
                        <div class=""detail-value"">{healthBook.bookingCode}</div>
                    </div>
                    <div class=""detail-row"">
                        <div class=""detail-label"">Next Visit Date:</div>
                        <div class=""detail-value"">{healthBook.nextVisitDate:dddd, MMMM dd, yyyy 'at' hh:mm tt}</div>
                    </div>
                </div>
                
                <div class=""reminder-note"">
                    <p style=""margin:0;"">Please arrive 10 minutes before your scheduled appointment time.</p>
                    <p style=""margin:10px 0 0 0;"">Don't forget to bring any required documents or medications.</p>
                </div>
                
                <p style=""margin:20px 0 0 0;"">Best regards,</p>
                <p style=""margin:0;font-weight:bold;color:#1e88e5;"">The PetEase Team</p>
              </td>
            </tr>
            
            <tr>
              <td style=""padding:30px;font-size:24px;line-height:28px;font-weight:bold;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);"">
                <img src=""https://i.pinimg.com/736x/9a/91/b2/9a91b2851d12c82909dc652224918dfc.jpg"" width=""540"" alt=""Pet care illustration"" style=""width:100%;height:auto;border:none;text-decoration:none;color:#363636;"">
              </td>
            </tr>
            
            <tr>
              <td style=""padding:30px;text-align:center;font-size:12px;background-color:#1565c0;color:#ffffff;"">
                <p style=""margin:0 0 5px 0;"">PetEase - Your trusted pet care partner</p>
                <p style=""margin:0;"">© 2024 PetEase. All rights reserved.</p>
              </td>
            </tr>

          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </div>
</body>
</html>";

            string subject = $"[PetEase] Reminder: {healthBook.PetName}'s Visit on {healthBook.nextVisitDate:MMMM dd}";
            var mail = new MailContent
            {
                To = account.AccountEmail,
                Body = message,
                Subject = subject
            };
            return SendMail(mail);
        }
    }
}
