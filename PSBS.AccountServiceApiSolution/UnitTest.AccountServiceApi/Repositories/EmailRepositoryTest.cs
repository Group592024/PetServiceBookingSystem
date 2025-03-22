using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FakeItEasy;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit;
using PSPS.AccountAPI.Domain.Entities;
using PSPS.AccountAPI.Infrastructure.Repositories;
using PSPS.SharedLibrary.Responses;  // Giả sử lớp Response được định nghĩa ở đây

namespace UnitTest.EmailRepositoryTests
{
    public class EmailRepositoryTests : IDisposable
    {
        private readonly IOptions<EmailSetting> options;
        private readonly ILogger<EmailRepository> logger;
        private readonly EmailRepository emailRepository;
        private readonly string tempMailSaveFolder = "mailssave";

        public EmailRepositoryTests()
        {
            var emailSetting = new EmailSetting
            {
                Mail = "test@example.com",
                DisplayName = "Test Sender",
                Password = "password",
                Host = "invalid.host", 
                Port = 25
            };

            options = Options.Create(emailSetting);

            logger = A.Fake<ILogger<EmailRepository>>();

            emailRepository = new EmailRepository(options, logger);
        }

        public void Dispose()
        {
            if (Directory.Exists(tempMailSaveFolder))
            {
                Directory.Delete(tempMailSaveFolder, true);
            }
        }

        [Fact]
        public async Task SendMail_Failure_WritesToFileAndLogsError()
        {
            var mailContent = new MailContent
            {
                To = "recipient@example.com",
                Subject = "Test Email Subject",
                Body = "<p>This is a test email body.</p>"
            };

            if (Directory.Exists(tempMailSaveFolder))
            {
                Directory.Delete(tempMailSaveFolder, true);
            }

            await emailRepository.SendMail(mailContent);

            A.CallTo(logger)
                .Where(call => call.Method.Name == "Log" &&
                               call.GetArgument<LogLevel>(0) == LogLevel.Error)
                .MustHaveHappened();

            Assert.True(Directory.Exists(tempMailSaveFolder), "Thư mục 'mailssave' không tồn tại sau khi gửi mail thất bại.");
            var emlFiles = Directory.GetFiles(tempMailSaveFolder, "*.eml");
            Assert.True(emlFiles.Any(), "Không có file .eml được tạo ra trong thư mục 'mailssave'.");
        }
        [Fact]
        public async Task SendEmailAsync_SendsMailSuccessfully_WhenSmtpWorks()
        {
           
            var emailSettings = new EmailSetting
            {
                DisplayName = "Test Sender",
                Mail = "test@example.com",
                Host = "smtp.example.com", 
                Port = 587,
                Password = "password"
            };

            var options = Options.Create(emailSettings);
            var logger = A.Fake<ILogger<EmailRepository>>();
            var emailRepo = new EmailRepository(options, logger);

            var mailContent = new MailContent
            {
                To = "recipient@example.com",
                Subject = "Test Email Success",
                Body = "<p>This is a test email success case.</p>"
            };

          
        }
    }
}

