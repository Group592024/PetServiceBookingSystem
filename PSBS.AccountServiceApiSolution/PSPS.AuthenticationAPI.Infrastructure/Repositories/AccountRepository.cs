using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.AccountAPI.Domain.Entities;
using PSPS.AccountAPI.Infrastructure.Data;
using PSPS.SharedLibrary.Responses;
using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;


namespace PSPS.AccountAPI.Infrastructure.Repositories
{
    // Lớp AccountRepository thực thi interface IAccount, cung cấp các chức năng liên quan đến tài khoản người dùng.
    internal class AccountRepository(PSPSDbContext context, IConfiguration config, IWebHostEnvironment _hostingEnvironment, IEmail _emailRepository) : IAccount
    {
        private const string ImageUploadPath = "images";// Định nghĩa đường dẫn lưu trữ ảnh người dùng

        // Hàm giúp lấy tài khoản người dùng từ cơ sở dữ liệu qua email
        private async Task<Account> GetAccountByAccountEmail(string email)
        {
            var account = await context.Accounts.FirstOrDefaultAsync(u =>u.AccountEmail == email);// Truy vấn tài khoản qua email
            return account is null ? null! : account; // Nếu không có tài khoản thì trả về null
        }
        // Lấy thông tin tài khoản bằng GUID của tài khoản
        public async Task<GetAccountDTO?> GetAccount(Guid AccountId)
        {
            var account = await context.Accounts.FirstOrDefaultAsync(u => u.AccountId == AccountId);// Lấy tài khoản qua GUID
            if (account == null)
                return null;// Nếu không có tài khoản, trả về null

            return new GetAccountDTO(// Trả về DTO chứa thông tin tài khoản nếu tìm thấy
                account.AccountId ?? Guid.Empty,                             
                account.AccountName ?? string.Empty,      
                account.AccountEmail ?? string.Empty,
                account.AccountPhoneNumber ?? string.Empty,
                account.AccountPassword ?? string.Empty,
                account.AccountGender ?? string.Empty,
                account.AccountDob ?? DateTime.MinValue, 
                account.AccountAddress ?? string.Empty,
                account.AccountImage ?? string.Empty,
                account.AccountLoyaltyPoint,         
                account.AccountIsDeleted,
                account.RoleId
            );
        }
        public async Task<Response> GetAllAccount() // Lấy tất cả tài khoản từ cơ sở dữ liệu
        {
            try
            {
                var accounts = await context.Accounts.ToListAsync();// Lấy tất cả tài khoản
                if (accounts == null || !accounts.Any())
                {
                    return new Response(false, "No accounts found");// Trả về lỗi nếu không có tài khoản
                }

                var accountDTOs = accounts.Select(account => new GetAccountDTO(// Chuyển tất cả tài khoản thành danh sách DTO và trả về
                    account.AccountId ?? Guid.Empty,
                    account.AccountName ?? string.Empty,
                    account.AccountEmail ?? string.Empty,
                    account.AccountPhoneNumber ?? string.Empty,
                    account.AccountPassword ?? string.Empty,
                    account.AccountGender ?? string.Empty,
                    account.AccountDob ?? DateTime.MinValue,
                    account.AccountAddress ?? string.Empty,
                    account.AccountImage ?? string.Empty,
                    account.AccountLoyaltyPoint,
                    account.AccountIsDeleted,
                    account.RoleId
                )).ToList();

                return new Response(true, "Accounts retrieved successfully") { Data = accountDTOs };// Trả về danh sách tài khoản thành công
            }
            catch (Exception ex)
            {
                return new Response(false, $"An error occurred: {ex.Message}");// Xử lý lỗi nếu có ngoại lệ
            }
        }



        public async Task<Response> Login(LoginDTO loginDTO)
        {
            try
            {
                var getAccount = await GetAccountByAccountEmail(loginDTO.AccountEmail);
                if (getAccount is null)
                    return new Response(false, "Account not found!");

                bool verifyPassword = BCrypt.Net.BCrypt.Verify(loginDTO.AccountPassword, getAccount.AccountPassword);
                if (!verifyPassword)
                    return new Response(false, "Wrong password!");

                string token = GenerateToken(getAccount);
                return new Response(true, "Login successfully!") { Data = token };
            }
            catch (Exception ex)
            {
                return new Response(false, $"An error occurred: {ex.Message}");
            }
        }

        private string GenerateToken(Account account)       // Hàm tạo mã thông báo JWT cho tài khoản
    {
            var key = Encoding.UTF8.GetBytes(config.GetSection("Authentication:Key").Value!);// Lấy khóa bí mật từ cấu hình
        var securityKey = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256); // Thiết lập phương thức ký
        var claims = new List<Claim>// Tạo danh sách claims để đính kèm thông tin tài khoản vào token
            {
                new(ClaimTypes.Name, account.AccountName!),
                new(ClaimTypes.Email, account.AccountEmail!),
            };
            if (!string.IsNullOrEmpty(account.RoleId) && Guid.TryParse(account.RoleId, out _))
                claims.Add(new(ClaimTypes.Role, account.RoleId!)); // Thêm claim role nếu có
        var token = new JwtSecurityToken(            // Tạo JWT Token

                issuer: config["Authentication:Issuer"],// Thiết lập Issuer
                audience: config["Authentication:Audience"],// Thiết lập Audience
                claims: claims,
                expires: null,// Không giới hạn thời gian hết hạn
                signingCredentials: credentials// Thiết lập thông tin chữ ký
                 );
            return new JwtSecurityTokenHandler().WriteToken(token);// Trả về chuỗi token
    }

        public async Task<Response> Register([FromForm] RegisterAccountDTO model)// Đăng ký tài khoản người dùng mới
    {
            try
            {
                // Kiểm tra email đã tồn tại

                var getAccount = await GetAccountByAccountEmail(model.RegisterTempDTO.AccountEmail);
                if (getAccount != null) return new Response(false, "Email existed!");// Nếu email đã tồn tại thì trả về lỗi



                if (model.UploadModel.ImageFile != null)// Kiểm tra và lưu ảnh đại diện người dùng nếu có
            {
                    List<string> allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif" };// Kiểm tra loại file ảnh
                string fileExtension = Path.GetExtension(model.UploadModel.ImageFile.FileName);
                    if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension, StringComparer.OrdinalIgnoreCase))
                    {
                        throw new Exception("File format not supported.");// Kiểm tra định dạng file
                }

                    string uploadPath = Path.Combine(_hostingEnvironment.ContentRootPath, ImageUploadPath);// Đường dẫn lưu ảnh
                if (!Directory.Exists(uploadPath))
                    {
                        Directory.CreateDirectory(uploadPath);// Nếu thư mục chưa tồn tại thì tạo mới
                }

                    string fileName = Path.GetRandomFileName() + fileExtension;// Tạo tên file ngẫu nhiên
                string filePath = Path.Combine(uploadPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await model.UploadModel.ImageFile.CopyToAsync(stream);// Lưu file vào thư mục
                }

                    var newAccount = new Account()// Tạo tài khoản mới
                    {
                        AccountName = model.RegisterTempDTO.AccountName,
                        AccountEmail = model.RegisterTempDTO.AccountEmail,
                        AccountPassword = BCrypt.Net.BCrypt.HashPassword(model.RegisterTempDTO.AccountPassword),// Mã hóa mật khẩu
                        AccountPhoneNumber = model.RegisterTempDTO.AccountPhoneNumber,
                        AccountGender = model.RegisterTempDTO.AccountGender,
                        AccountAddress = model.RegisterTempDTO.AccountAddress,
                        AccountImage = fileName,
                        AccountDob = model.RegisterTempDTO.AccountDob,
                        AccountId = Guid.NewGuid(), // Tạo GUID mới cho tài khoản
                        RoleId = "user"// Mặc định là người dùng
                    };
                    var result = context.Accounts.Add(newAccount);// Thêm tài khoản mới vào cơ sở dữ liệu
                await context.SaveChangesAsync();// Lưu thay đổi vào cơ sở dữ liệu
                return !string.IsNullOrEmpty(result.Entity.AccountId.ToString())
                        ? new Response(true, "Account registered successfully")// Đăng ký thành công
                        : new Response(false, "Invalid data provided");// Nếu có lỗi
            }
                // Kiểm tra kết quả
                return new Response(false, "Invalid data provided");
            }
            catch (DbUpdateException dbEx)
            {
                // Xử lý ngoại lệ liên quan đến cơ sở dữ liệu
                return new Response(false, $"Database error: {dbEx.Message}");
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ chung
                return new Response(false, $"An unexpected error occurred: {ex.Message}");
            }
        }
        public async Task<Response> UpdateAccount([FromForm] AddAccount model)// Cập nhật thông tin tài khoản người dùng
    {
            try
            {
                // Validate dữ liệu đầu vào
                if (model == null || model.AccountTempDTO == null)
                {
                    return new Response(false, "Invalid model!");
                }

                // Kiểm tra Account tồn tại
                var account = await context.Accounts.FirstOrDefaultAsync(u => u.AccountId == model.AccountTempDTO.AccountId);
                if (account == null)
                {
                    return new Response(false, "Account does not exist!");
                }

                // Kiểm tra các trường bắt buộc
                if (string.IsNullOrEmpty(model.AccountTempDTO.AccountName) ||
                    string.IsNullOrEmpty(model.AccountTempDTO.AccountEmail))
                {
                    return new Response(false, "Name and Email cannot be empty!");
                }

                // Validate Email
                if (!Regex.IsMatch(model.AccountTempDTO.AccountEmail, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                {
                    return new Response(false, "Invalid email!");
                }

                // Validate số điện thoại
                if (!string.IsNullOrEmpty(model.AccountTempDTO.AccountPhoneNumber) &&
                    !Regex.IsMatch(model.AccountTempDTO.AccountPhoneNumber, @"^\d{10,15}$"))
                {
                    return new Response(false, "Invalid phone number!");
                }
                if (model.AccountTempDTO.isPickImage == true)// Kiểm tra xem người dùng có chọn thay đổi ảnh đại diện không
            {
                    if (model.UploadModel.ImageFile != null)
                    {
                        List<string> allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif" };
                        string fileExtension = Path.GetExtension(model.UploadModel.ImageFile.FileName);
                        if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension, StringComparer.OrdinalIgnoreCase))
                        {
                            throw new Exception("File format not supported.");
                        }

                        string uploadPath = Path.Combine(_hostingEnvironment.ContentRootPath, ImageUploadPath);
                        if (!Directory.Exists(uploadPath))
                        {
                            Directory.CreateDirectory(uploadPath);
                        }

                        string fileName = Path.GetRandomFileName() + fileExtension;
                        string filePath = Path.Combine(uploadPath, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await model.UploadModel.ImageFile.CopyToAsync(stream);
                        }

                        account.AccountImage = fileName;
                    }
                // Cập nhật các thông tin khác của tài khoản
                    account.AccountName = model.AccountTempDTO.AccountName;
                    account.AccountPhoneNumber = model.AccountTempDTO.AccountPhoneNumber;
                    account.AccountGender = model.AccountTempDTO.AccountGender;
                    account.AccountDob = model.AccountTempDTO.AccountDob;
                    account.AccountEmail = model.AccountTempDTO.AccountEmail;
                    account.AccountAddress = model.AccountTempDTO.AccountAddress;
                    context.Accounts.Update(account);
                    await context.SaveChangesAsync();
                    return new Response(true, "User updated successfully");
                    
                }
                else
                {
                    account.AccountName = model.AccountTempDTO.AccountName;
                    account.AccountPhoneNumber = model.AccountTempDTO.AccountPhoneNumber;
                    account.AccountGender = model.AccountTempDTO.AccountGender;
                    account.AccountDob = model.AccountTempDTO.AccountDob;
                    account.AccountEmail = model.AccountTempDTO.AccountEmail;
                    account.AccountAddress = model.AccountTempDTO.AccountAddress;
                    context.Accounts.Update(account);
                    await context.SaveChangesAsync();
                    return new Response(true, "User updated without image successfully");
                   
                }


            }
            catch (Exception ex)
            {
                return new Response(false, "Internal server error" + ex.Message); // Xử lý lỗi server

        }
        }

        public async Task<Response> ChangePassword(Guid accountId, ChangePasswordDTO changePasswordDTO)// Thay đổi mật khẩu người dùng
    {
            try
            {
            // Lấy thông tin tài khoản từ cơ sở dữ liệu
            var account = await context.Accounts.FirstOrDefaultAsync(a => a.AccountId == accountId);

                if (account == null)
                {
                    return new Response(false, "Account not found");
                }
            // Kiểm tra mật khẩu hiện tại có đúng không
            bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(changePasswordDTO.CurrentPassword, account.AccountPassword);
                if (!isCurrentPasswordValid)
                {
                    return new Response(false, "Current password is incorrect");
                }

            // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
            if (changePasswordDTO.NewPassword != changePasswordDTO.ConfirmPassword)
                {
                    return new Response(false, "New password and confirm password do not match");
                }

            // Cập nhật mật khẩu mới vào cơ sở dữ liệu
            bool isNewPasswordSameAsCurrent = BCrypt.Net.BCrypt.Verify(changePasswordDTO.NewPassword, account.AccountPassword);
                if (isNewPasswordSameAsCurrent)
                {
                    return new Response(false, "New password cannot be the same as the current password");
                }

                // Hash the new password before updating
                account.AccountPassword = BCrypt.Net.BCrypt.HashPassword(changePasswordDTO.NewPassword);

                // Update the account's password in the database
                context.Accounts.Update(account);
                await context.SaveChangesAsync();

                return new Response(true, "Password changed successfully");
            }
            catch (Exception ex)
            {
                // Handle and log exceptions as needed
                return new Response(false, $"An error occurred: {ex.Message}");// Xử lý lỗi nếu có
        }
        }
        public async Task<Response> ForgotPassword(string AccountEmail)
        {
            try
            {
                // Lấy tài khoản theo email
                var account = await GetAccountByAccountEmail(AccountEmail);
                if (account == null)
                {
                    // Trả về thông báo chung để tránh lộ thông tin tài khoản
                    return new Response(false, "If the account exists, a password reset email has been sent.");
                }

                // Tạo mật khẩu mới
                string newPassword = GenerateRandomPassword();

                // Gửi email chứa mật khẩu mới trước khi cập nhật mật khẩu
                var emailSent = await SendPasswordResetEmail(AccountEmail, newPassword);
                if (!emailSent)
                {
                    return new Response(false, "Failed to send password reset email. Please try again.");
                }

                // Hash mật khẩu mới và lưu vào cơ sở dữ liệu
                account.AccountPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
                context.Accounts.Update(account);
                await context.SaveChangesAsync();

                return new Response(true, "A new password has been sent to your email.");
            }
            catch (Exception ex)
            {
                // Log lỗi
                Console.WriteLine($"ForgotPassword Error: {ex.Message}");
                return new Response(false, "An error occurred. Please try again later.");
            }
        }

        private string GenerateRandomPassword()
        {
            // Tạo mật khẩu ngẫu nhiên với độ dài 8 ký tự
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var password = new char[8];
            using (var rng = RandomNumberGenerator.Create())
            {
                var byteArray = new byte[8];
                rng.GetBytes(byteArray);
                for (int i = 0; i < password.Length; i++)
                {
                    password[i] = chars[byteArray[i] % chars.Length];
                }
            }
            return new string(password);
        }

        public async Task<bool> SendPasswordResetEmail(string AccountEmail, string newPassword)
        {
            try
            {
                // Nội dung email
                var mailContent = new MailContent
                {
                    Subject = "Password Reset Request",
                    To = AccountEmail,
                    Body = $@"<p>Your password has been reset successfully. Your new password is:</p>
            <p><strong>{newPassword}</strong></p>
            <p>Please change your password after logging in.</p>"
                };

                // Gửi email
                await _emailRepository.SendMail(mailContent);
                return true; // Nếu gửi email thành công
            }
            catch (Exception ex)
            {
                // Log lỗi
                Console.WriteLine($"Email send failed: {ex.Message}");
                return false; // Nếu gửi email thất bại
            }
        }

        // Implement từ base interface nhưng cấu trúc của Account phức tạp hơn cần parameter đặc thù vẫn giữ nguyên cho các service khác
        public Task<Response> CreateAsync(Account entity)
        {
            throw new NotImplementedException();
        }

        public Task<Response> UpdateAsync(Account entity)
        {
            throw new NotImplementedException();
        }

        public Task<Response> DeleteAsync(Account entity)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Account>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Account> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<Account> GetByAsync(Expression<Func<Account, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<Account> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }
    }
}
