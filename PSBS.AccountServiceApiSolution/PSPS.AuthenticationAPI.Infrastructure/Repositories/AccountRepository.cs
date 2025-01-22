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
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;


namespace PSPS.AccountAPI.Infrastructure.Repositories
{
    
    internal class AccountRepository(PSPSDbContext context, IConfiguration config, IWebHostEnvironment _hostingEnvironment, IEmail _emailRepository, IHttpClientFactory _httpClientFactory) : IAccount
    {
        private const string ImageUploadPath = "images";

     
        private async Task<Account> GetAccountByAccountEmail(string email)
        {
            var account = await context.Accounts.FirstOrDefaultAsync(u =>u.AccountEmail == email);
            return account is null ? null! : account; 
        }
       
        public async Task<GetAccountDTO?> GetAccount(Guid AccountId)// Get account by AccountId
        {
            var account = await context.Accounts.FirstOrDefaultAsync(u => u.AccountId == AccountId);
            if (account == null)
                return null;

            return new GetAccountDTO(
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
        public async Task<bool> UpdateAccountAsync(Account account)
        {
            context.Accounts.Update(account);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<Account> GetAccountByIdAsync(Guid accountId)
        {
            return await context.Accounts.FindAsync(accountId);
        }
        public async Task<Response> RedeemPointsAsync(Guid accountId, RedeemRequest model)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var account = await GetAccountByIdAsync(accountId);
                if (account == null)
                {
                    return new Response(false, "Account not found");
                }
                if (account.AccountLoyaltyPoint < model.RequiredPoints)
                {
                    return new Response(false, "Not enough points to redeem gift");
                }

                account.AccountLoyaltyPoint -= model.RequiredPoints;
                var updateResult = await UpdateAccountAsync(account);
                if (!updateResult)
                {
                    return new Response(false, "Failed to update account");
                }

                var redeemHistoryRequest = new RedeemHistoryRequestDTO
                {
                    AccountId = accountId,
                    GiftId = model.GiftId,
                    RedeemPoint = model.RequiredPoints,
                    RedeemDate = DateTime.UtcNow
                };

                var client = _httpClientFactory.CreateClient();
                var apiUrl = "http://localhost:5022/redeemhistory";
                var response = await client.PostAsJsonAsync(apiUrl, redeemHistoryRequest);

                if (response.IsSuccessStatusCode)
                {
                    await transaction.CommitAsync();
                    return new Response(true, "Gift redeemed successfully");
                }

                await transaction.RollbackAsync();
                return new Response(false, "Failed to redeem gift");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new Response(false, $"Error: {ex.Message}");
            }
        }

        public async Task<Response> GetAllAccount() // Get all accountlist
        {
            try
            {
                var accounts = await context.Accounts.ToListAsync();
                if (accounts == null || !accounts.Any())
                {
                    return new Response(false, "No accounts found");
                }

                var accountDTOs = accounts.Select(account => new GetAccountDTO(
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

                return new Response(true, "Accounts retrieved successfully") { Data = accountDTOs };
            }
            catch (Exception ex)
            {
                return new Response(false, $"An error occurred: {ex.Message}");
            }
        }
        public async Task<Response> GetDeletedAccounts() // get list accoint  AccountIsDeleted = true
        {
            try
            {
                var accounts = await context.Accounts
                    .Where(account => account.AccountIsDeleted)
                    .ToListAsync(); 

                if (accounts == null || !accounts.Any())
                {
                    return new Response(false, "No deleted accounts found"); 
                }

                var accountDTOs = accounts.Select(account => new GetAccountDTO(
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

                return new Response(true, "Deleted accounts retrieved successfully") { Data = accountDTOs };
            }
            catch (Exception ex)
            {
                return new Response(false, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<Response> GetActiveAccounts() // Lget list account AccountIsDeleted = false
        {
            try
            {
                var accounts = await context.Accounts
                    .Where(account => !account.AccountIsDeleted)
                    .ToListAsync();

                if (accounts == null || !accounts.Any())
                {
                    return new Response(false, "No active accounts found");
                }

                var accountDTOs = accounts.Select(account => new GetAccountDTO(
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

                return new Response(true, "Active accounts retrieved successfully") { Data = accountDTOs };
            }
            catch (Exception ex)
            {
                return new Response(false, $"An error occurred: {ex.Message}"); 
            }
        }



        public async Task<Response> Login(LoginDTO loginDTO) //Login
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

        private string GenerateToken(Account account)       // Generatoken with jwt
    {
            var key = Encoding.UTF8.GetBytes(config.GetSection("Authentication:Key").Value!);
        var securityKey = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256); 
        var claims = new List<Claim>
            {
                new(ClaimTypes.Name, account.AccountName!),
                new(ClaimTypes.Email, account.AccountEmail!),
                new(ClaimTypes.Role, account.RoleId!),
            };
            claims.Add(new Claim("AccountId", account.AccountId.ToString()));
            claims.Add(new Claim("AccountImage", account.AccountImage));
            claims.Add(new Claim("AccountName", account.AccountName));
            claims.Add(new Claim("AccountIsDeleted", account.AccountIsDeleted.ToString()));

            if (!string.IsNullOrEmpty(account.RoleId) && Guid.TryParse(account.RoleId, out _))
                claims.Add(new(ClaimTypes.Role, account.RoleId!)); 
        var token = new JwtSecurityToken(           

                issuer: config["Authentication:Issuer"],
                audience: config["Authentication:Audience"],
                claims: claims,
                expires: null,
                signingCredentials: credentials
                 );
            return new JwtSecurityTokenHandler().WriteToken(token);
    }

        public async Task<Response> Register([FromForm] RegisterAccountDTO model)//Register account
        {
            try
            {
                var getAccount = await GetAccountByAccountEmail(model.RegisterTempDTO.AccountEmail);
                if (getAccount != null)
                    return new Response(false, "Email existed!");

                string fileName = GetDefaultImage(); 

                if (model.UploadModel?.ImageFile != null)
                {
                    List<string> allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif" };
                    string fileExtension = Path.GetExtension(model.UploadModel.ImageFile.FileName);

                    if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension, StringComparer.OrdinalIgnoreCase))
                    {
                        return new Response(false, "Unsupported file format.");
                    }

                    string uploadPath = Path.Combine(_hostingEnvironment.ContentRootPath, ImageUploadPath);
                    if (!Directory.Exists(uploadPath))
                    {
                        Directory.CreateDirectory(uploadPath);
                    }

                    fileName = Path.GetRandomFileName() + fileExtension;
                    string filePath = Path.Combine(uploadPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await model.UploadModel.ImageFile.CopyToAsync(stream);
                    }
                }

                var newAccount = new Account()
                {
                    AccountName = model.RegisterTempDTO.AccountName,
                    AccountEmail = model.RegisterTempDTO.AccountEmail,
                    AccountPassword = BCrypt.Net.BCrypt.HashPassword(model.RegisterTempDTO.AccountPassword),
                    AccountPhoneNumber = model.RegisterTempDTO.AccountPhoneNumber,
                    AccountGender = model.RegisterTempDTO.AccountGender,
                    AccountAddress = model.RegisterTempDTO.AccountAddress,
                    AccountImage = fileName, 
                    AccountDob = model.RegisterTempDTO.AccountDob,
                    AccountId = Guid.NewGuid(),
                    RoleId = "user"
                };

                var result = context.Accounts.Add(newAccount);
                await context.SaveChangesAsync();

                return !string.IsNullOrEmpty(result.Entity.AccountId.ToString())
                    ? new Response(true, "Account registered successfully")
                    : new Response(false, "Invalid data provided");
            }
            catch (DbUpdateException dbEx)
            {
                return new Response(false, $"Database error: {dbEx.Message}");
            }
            catch (Exception ex)
            {
                return new Response(false, $"An unexpected error occurred: {ex.Message}");
            }
        }


        public async Task<Response> AddAccount([FromForm] RegisterAccountDTO model) // Add account
        {
            try
            {
                var getAccount = await GetAccountByAccountEmail(model.RegisterTempDTO.AccountEmail);
                if (getAccount != null)
                    return new Response(false, "Email existed!");

                string fileName = GetDefaultImage();

                if (model.UploadModel?.ImageFile != null)
                {
                    List<string> allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif" };
                    string fileExtension = Path.GetExtension(model.UploadModel.ImageFile.FileName);

                    if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension, StringComparer.OrdinalIgnoreCase))
                    {
                        return new Response(false, "Unsupported file format.");
                    }

                    string uploadPath = Path.Combine(_hostingEnvironment.ContentRootPath, ImageUploadPath);
                    if (!Directory.Exists(uploadPath))
                    {
                        Directory.CreateDirectory(uploadPath);
                    }

                    fileName = Path.GetRandomFileName() + fileExtension;
                    string filePath = Path.Combine(uploadPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await model.UploadModel.ImageFile.CopyToAsync(stream);
                    }
                }

                var newAccount = new Account()
                {
                    AccountName = "User",
                    AccountEmail = model.RegisterTempDTO.AccountEmail,
                    AccountPassword = BCrypt.Net.BCrypt.HashPassword("123456"), 
                    AccountPhoneNumber = model.RegisterTempDTO.AccountPhoneNumber, 
                    AccountGender = "Male", 
                    AccountAddress = "Address", 
                    AccountImage = fileName,
                    AccountDob = DateTime.Now.AddYears(-20), 
                    AccountId = Guid.NewGuid(),
                    RoleId = "user"
                };

                var result = context.Accounts.Add(newAccount);
                await context.SaveChangesAsync();

                return !string.IsNullOrEmpty(result.Entity.AccountId.ToString())
                    ? new Response(true, "Account registered successfully")
                    : new Response(false, "Invalid data provided");
            }
            catch (DbUpdateException dbEx)
            {
                return new Response(false, $"Database error: {dbEx.Message}");
            }
            catch (Exception ex)
            {
                return new Response(false, $"An unexpected error occurred: {ex.Message}");
            }
        }

        private string GetDefaultImage() 
        {
            string imagesPath = Path.Combine(_hostingEnvironment.ContentRootPath, "images");
            if (!Directory.Exists(imagesPath))
            {
                Directory.CreateDirectory(imagesPath);
                return "default.jpg"; 
            }

            var imageFiles = Directory.GetFiles(imagesPath, "*.*")
                                       .Where(file => new[] { ".jpg", ".jpeg", ".png", ".gif" }
                                       .Contains(Path.GetExtension(file), StringComparer.OrdinalIgnoreCase))
                                       .ToList();

            if (imageFiles.Any())
            {
                Random random = new Random();
                return Path.GetFileName(imageFiles[random.Next(imageFiles.Count)]);
            }

            return "default.jpg"; 
        }

        public async Task<Response> UpdateAccount([FromForm] AddAccount model)
        {
            try
            {
                if (model == null || model.AccountTempDTO == null)
                {
                    return new Response(false, "Invalid model!");
                }

                var account = await context.Accounts.FirstOrDefaultAsync(u => u.AccountId == model.AccountTempDTO.AccountId);
                if (account == null)
                {
                    return new Response(false, "Account does not exist!");
                }

                if (!string.IsNullOrEmpty(model.AccountTempDTO.AccountName))
                    account.AccountName = model.AccountTempDTO.AccountName;

                if (!string.IsNullOrEmpty(model.AccountTempDTO.AccountPhoneNumber))
                    account.AccountPhoneNumber = model.AccountTempDTO.AccountPhoneNumber;

                if (!string.IsNullOrEmpty(model.AccountTempDTO.AccountGender))
                    account.AccountGender = model.AccountTempDTO.AccountGender;

                if (!string.IsNullOrEmpty(model.AccountTempDTO.AccountEmail))
                {
                    if (!Regex.IsMatch(model.AccountTempDTO.AccountEmail, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                        return new Response(false, "Invalid email!");
                    account.AccountEmail = model.AccountTempDTO.AccountEmail;
                }
                if (model.AccountTempDTO.AccountDob != null)
                {
                    account.AccountDob = model.AccountTempDTO.AccountDob.Value;
                }
                if (!string.IsNullOrEmpty(model.AccountTempDTO.AccountAddress))
                    account.AccountAddress = model.AccountTempDTO.AccountAddress;

                if (!string.IsNullOrEmpty(model.AccountTempDTO.RoleId))
                    account.RoleId = model.AccountTempDTO.RoleId;
                if (model.AccountTempDTO.isPickImage == true && model.UploadModel?.ImageFile != null)
                {
                    List<string> allowedExtensions = new List<string> { ".jpg", ".jpeg", ".png", ".gif" };
                    string fileExtension = Path.GetExtension(model.UploadModel.ImageFile.FileName);
                    if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension, StringComparer.OrdinalIgnoreCase))
                    {
                        return new Response(false, "File format not supported.");
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
                else if (model.AccountTempDTO.isPickImage == false)
                {
                   
                }

                context.Accounts.Update(account);
                await context.SaveChangesAsync();

                return new Response(true, model.AccountTempDTO.isPickImage == true
                    ? "User updated with new image successfully"
                    : "User updated without changing image successfully");
            }
            catch (Exception ex)
            {
                return new Response(false, "Internal server error: " + ex.Message);
            }
        }

        public async Task<Response> LoadImage(string fileName) // LoadImage with file Images
        {
            try
            {
                string uploadPath = Path.Combine(_hostingEnvironment.ContentRootPath, ImageUploadPath);

                if (!Directory.Exists(uploadPath))
                {
                    throw new Exception("Image directory does not exist.");
                }

                string filePath = Path.Combine(uploadPath, fileName);

                if (!File.Exists(filePath))
                {
                    throw new Exception("Image file not found.");
                }
                byte[] fileBytes = await File.ReadAllBytesAsync(filePath);
                string mimeType = "image/jpeg"; 
                if (filePath.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                {
                    mimeType = "image/png";
                }
                else if (filePath.EndsWith(".gif", StringComparison.OrdinalIgnoreCase))
                {
                    mimeType = "image/gif";
                }

                return new Response(true, "User updated without image successfully") { Data= new FileContentResult(fileBytes, mimeType) };
            }
            catch (Exception ex)
            {
                return new Response(false, $"Internal server error: {ex.Message}");
            }
        }


        public async Task<Response> ChangePassword(Guid accountId, ChangePasswordDTO changePasswordDTO)//Changepassword Account
    {
            try
            {
        
            var account = await context.Accounts.FirstOrDefaultAsync(a => a.AccountId == accountId);

                if (account == null)
                {
                    return new Response(false, "Account not found");
                }
          
            bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(changePasswordDTO.CurrentPassword, account.AccountPassword);
                if (!isCurrentPasswordValid)
                {
                    return new Response(false, "Current password is incorrect");
                }

            if (changePasswordDTO.NewPassword != changePasswordDTO.ConfirmPassword)
                {
                    return new Response(false, "New password and confirm password do not match");
                }

       
            bool isNewPasswordSameAsCurrent = BCrypt.Net.BCrypt.Verify(changePasswordDTO.NewPassword, account.AccountPassword);
                if (isNewPasswordSameAsCurrent)
                {
                    return new Response(false, "New password cannot be the same as the current password");
                }
                account.AccountPassword = BCrypt.Net.BCrypt.HashPassword(changePasswordDTO.NewPassword);
                context.Accounts.Update(account);
                await context.SaveChangesAsync();

                return new Response(true, "Password changed successfully");
            }
            catch (Exception ex)
            {
     
                return new Response(false, $"An error occurred: {ex.Message}");
        }
        }
        public async Task<Response> ForgotPassword(string AccountEmail) // Forgotpassword with Email
        {
            try
            {
     
                var account = await GetAccountByAccountEmail(AccountEmail);
                if (account == null)
                {
                    return new Response(false, "If the account exists, a password reset email has been sent.");
                }
                string newPassword = GenerateRandomPassword();
                var emailSent = await SendPasswordResetEmail(AccountEmail, newPassword);
                if (!emailSent)
                {
                    return new Response(false, "Failed to send password reset email. Please try again.");
                }
                account.AccountPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
                context.Accounts.Update(account);
                await context.SaveChangesAsync();

                return new Response(true, "A new password has been sent to your email.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ForgotPassword Error: {ex.Message}");
                return new Response(false, "An error occurred. Please try again later.");
            }
        }

        private string GenerateRandomPassword() //Random new password
        {
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

        public async Task<bool> SendPasswordResetEmail(string AccountEmail, string newPassword) //Sendoassword with email
        {
            try
            {
                var mailContent = new MailContent
                {
                    Subject = "Password Reset Request",
                    To = AccountEmail,
                    Body = $@"<p>Your password has been reset successfully. Your new password is:</p>
            <p><strong>{newPassword}</strong></p>
            <p>Please change your password after logging in.</p>"
                };
                await _emailRepository.SendMail(mailContent);
                return true; 
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email send failed: {ex.Message}");
                return false; 
            }
        }
        public async Task<Response> DeleteAccount(Guid accountId) //Delete account
        {
            try
            {
                var account = await context.Accounts.FirstOrDefaultAsync(a => a.AccountId == accountId);

                if (account == null)
                    return null; 

                if (!account.AccountIsDeleted)
                {
                    account.AccountIsDeleted = true;
                    context.Accounts.Update(account);
                    await context.SaveChangesAsync();
                    return new Response(true, "Account marked as deleted (soft delete).");
                }
                else
                {
                    context.Accounts.Remove(account);
                    await context.SaveChangesAsync();
                    return new Response(true, "Account permanently deleted (hard delete).");
                }
            }
            catch (Exception ex)
            {
                return new Response(false, $"An error occurred: {ex.Message}");
            }
        }

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
