using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FakeItEasy;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.AccountAPI.Domain.Entities;
using PSPS.AccountAPI.Infrastructure.Data;
using PSPS.AccountAPI.Infrastructure.Repositories;
using PSPS.SharedLibrary.Responses;
using Xunit;

namespace UnitTest.AccountRepositoryTests
{
    public class AccountRepositoryMethodTests : IDisposable
    {
        private readonly PSPSDbContext _context;
        private readonly AccountRepository _repository;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IEmail _emailRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _tempContentRoot;

        public AccountRepositoryMethodTests()
        {
            var options = new DbContextOptionsBuilder<PSPSDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new PSPSDbContext(options);

            var inMemorySettings = new Dictionary<string, string>
            {
                {"Authentication:Key", "ThisIsASecretKeyForJWTDontShare12345!"},
                {"Authentication:Issuer", "TestIssuer"},
                {"Authentication:Audience", "TestAudience"}
            };
            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            _tempContentRoot = Path.Combine(Path.GetTempPath(), "AccountRepoTests_" + Guid.NewGuid());
            Directory.CreateDirectory(_tempContentRoot);

            _hostingEnvironment = A.Fake<IWebHostEnvironment>();
            A.CallTo(() => _hostingEnvironment.ContentRootPath).Returns(_tempContentRoot);

            _emailRepository = A.Fake<IEmail>();

            _httpClientFactory = A.Fake<IHttpClientFactory>();
            var fakeClient = new HttpClient(new FakeHttpMessageHandler())
            {
                BaseAddress = new Uri("http://localhost/")
            };
            A.CallTo(() => _httpClientFactory.CreateClient("ApiGateway")).Returns(fakeClient);

            _repository = new AccountRepository(_context, _configuration, _hostingEnvironment, _emailRepository, _httpClientFactory);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();

            if (Directory.Exists(_tempContentRoot))
            {
                Directory.Delete(_tempContentRoot, true);
            }
        }

        #region GetAccount, GetAccountByIdAsync, UpdateAccountAsync

        [Fact]
        public async Task GetAccount_ReturnsCorrectDTO_WhenAccountExists()
        {
            var newAccount = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "Test User",
                AccountEmail = "test@example.com",
                AccountPhoneNumber = "123456789",
                AccountPassword = "password",
                AccountGender = "Male",
                AccountDob = new DateTime(1990, 1, 1),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Test Address",
                AccountImage = "test.jpg",
                AccountLoyaltyPoint = 100,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(newAccount);
            await _context.SaveChangesAsync();

            var result = await _repository.GetAccount(newAccount.AccountId ?? Guid.Empty);

            Assert.NotNull(result);
            Assert.Equal(newAccount.AccountName, result.AccountName);
            Assert.Equal(newAccount.AccountEmail, result.AccountEmail);
        }

        [Fact]
        public async Task GetAccount_ReturnsNull_WhenAccountNotFound()
        {
            var result = await _repository.GetAccount(Guid.NewGuid());

            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateAccountAsync_ReturnsTrue_WhenUpdateSucceeds()
        {
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "UpdateTest",
                AccountEmail = "update@example.com",
                AccountPhoneNumber = "555555555",
                AccountPassword = "pass",
                AccountGender = "Female",
                AccountDob = new DateTime(1995, 5, 5),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "img.jpg",
                AccountLoyaltyPoint = 50,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            account.AccountName = "Updated Name";

            var result = await _repository.UpdateAccountAsync(account);

            Assert.True(result);

            var updated = await _context.Accounts.FindAsync(account.AccountId);
            Assert.Equal("Updated Name", updated.AccountName);
        }

        [Fact]
        public async Task GetAccountByIdAsync_ReturnsAccount_WhenExists()
        {
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "Lookup User",
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var result = await _repository.GetAccountByIdAsync(account.AccountId!.Value);


            Assert.NotNull(result);
            Assert.Equal(account.AccountName, result.AccountName);
        }

        #endregion

        #region RedeemPointsAsync

        //[Fact]
        //public async Task RedeemPointsAsync_ReturnsAccountNotFound_WhenAccountDoesNotExist()
        //{
        //    // Arrange
        //    var redeemRequest = new RedeemRequest
        //    {
        //        GiftId = Guid.NewGuid(),
        //        RequiredPoints = 100
        //    };

        //    // Act
        //    var response = await _repository.RedeemPointsAsync(Guid.NewGuid(), redeemRequest);

        //    // Assert
        //    Assert.False(response.Flag);
        //    Assert.Equal("Account not found", response.Message);
        //}

        //[Fact]
        //public async Task RedeemPointsAsync_ReturnsNotEnoughPoints_WhenInsufficient()
        //{
        //    // Arrange
        //    var account = new Account
        //    {
        //        AccountId = Guid.NewGuid(),
        //        AccountName = "Redeem Test",
        //        AccountLoyaltyPoint = 50, // ít hơn điểm yêu cầu
        //        AccountEmail = "redeem@example.com",
        //        AccountPhoneNumber = "000",
        //        AccountPassword = "pass",
        //        AccountGender = "Male",
        //        AccountDob = DateTime.UtcNow,
        //        CreatedAt = DateTime.UtcNow,
        //        UpdatedAt = DateTime.UtcNow,
        //        AccountAddress = "Address",
        //        AccountImage = "img.jpg",
        //        AccountIsDeleted = false,
        //        RoleId = "User"
        //    };
        //    _context.Accounts.Add(account);
        //    await _context.SaveChangesAsync();

        //    var redeemRequest = new RedeemRequest
        //    {
        //        GiftId = Guid.NewGuid(),
        //        RequiredPoints = 100 // yêu cầu nhiều hơn
        //    };

        //    // Act
        //    var response = await _repository.RedeemPointsAsync(account.AccountId ?? Guid.Empty, redeemRequest);

        //    // Assert
        //    Assert.False(response.Flag);
        //    Assert.Equal("Not enough points to redeem gift", response.Message);
        //}

        //[Fact]
        //public async Task RedeemPointsAsync_ReturnsSuccessfulResponse_WhenSucceed()
        //{
        //    // Arrange
        //    var account = new Account
        //    {
        //        AccountId = Guid.NewGuid(),
        //        AccountName = "Redeem Success",
        //        AccountLoyaltyPoint = 200,
        //        AccountEmail = "redeem_success@example.com",
        //        AccountPhoneNumber = "123123123",
        //        AccountPassword = "pass",
        //        AccountGender = "Male",
        //        AccountDob = DateTime.UtcNow,
        //        CreatedAt = DateTime.UtcNow,
        //        UpdatedAt = DateTime.UtcNow,
        //        AccountAddress = "Address",
        //        AccountImage = "img.jpg",
        //        AccountIsDeleted = false,
        //        RoleId = "User"
        //    };
        //    _context.Accounts.Add(account);
        //    await _context.SaveChangesAsync();

        //    var redeemRequest = new RedeemRequest
        //    {
        //        GiftId = Guid.NewGuid(),
        //        RequiredPoints = 100
        //    };

        //    // Fake HttpClient trong FakeHttpMessageHandler (xem phần dưới)
        //    // Act
        //    var response = await _repository.RedeemPointsAsync(account.AccountId ?? Guid.Empty, redeemRequest);

        //    // Assert
        //    Assert.True(response.Flag);
        //    Assert.Equal("Redeem successful", response.Message);

        //    // Kiểm tra số điểm đã được trừ
        //    var updated = await _context.Accounts.FindAsync(account.AccountId);
        //    Assert.Equal(100, updated.AccountLoyaltyPoint);
        //}

        #endregion

        #region GetAllAccount, GetAllStaffAccount, GetAllCustomerAccount, GetDeletedAccounts, GetActiveAccounts

        [Fact]
        public async Task GetAllAccount_ReturnsResponseWithData_WhenAccountsExist()
        {
            _context.Accounts.AddRange(
                new Account
                {
                    AccountId = Guid.NewGuid(),
                    AccountName = "User1",
                    AccountEmail = "user1@example.com",
                    AccountPhoneNumber = "0123456789",
                    AccountPassword = "pass1",
                    AccountGender = "Male",
                    AccountDob = new DateTime(1990, 1, 1),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    AccountAddress = "Address 1",
                    AccountImage = "img1.jpg",
                    AccountLoyaltyPoint = 50,
                    AccountIsDeleted = false,
                    RoleId = "User"
                },
                new Account
                {
                    AccountId = Guid.NewGuid(),
                    AccountName = "User2",
                    AccountEmail = "user2@example.com",
                    AccountPhoneNumber = "0987654321",
                    AccountPassword = "pass2",
                    AccountGender = "Female",
                    AccountDob = new DateTime(1992, 2, 2),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    AccountAddress = "Address 2",
                    AccountImage = "img2.jpg",
                    AccountLoyaltyPoint = 70,
                    AccountIsDeleted = false,
                    RoleId = "User"
                }
            );
            await _context.SaveChangesAsync();

            var response = await _repository.GetAllAccount();

            Assert.True(response.Flag);
            Assert.Equal("Accounts retrieved successfully", response.Message);
            var list = response.Data as List<GetAccountDTO>;
            Assert.NotNull(list);
            Assert.Equal(2, list.Count);
        }

        [Fact]
        public async Task GetAllStaffAccount_ReturnsResponseWithData_WhenStaffExist()
        {
            _context.Accounts.AddRange(
                new Account
                {
                    AccountId = Guid.NewGuid(),
                    AccountName = "Staff1",
                    AccountEmail = "staff1@example.com",
                    AccountPhoneNumber = "1111111111",
                    AccountPassword = "pass",
                    AccountGender = "Male",
                    AccountDob = new DateTime(1985, 1, 1),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    AccountAddress = "Staff Address",
                    AccountImage = "staff.jpg",
                    AccountLoyaltyPoint = 10,
                    AccountIsDeleted = false,
                    RoleId = "staff"
                }
            );
            await _context.SaveChangesAsync();

            var response = await _repository.GetAllStaffAccount();

            Assert.True(response.Flag);
            Assert.Equal("Staff accounts retrieved successfully", response.Message);
            var list = response.Data as List<GetAccountDTO>;
            Assert.NotNull(list);
            Assert.Single(list);
        }

        [Fact]
        public async Task GetAllCustomerAccount_ReturnsResponseWithData_WhenCustomersExist()
        {
            _context.Accounts.AddRange(
                new Account
                {
                    AccountId = Guid.NewGuid(),
                    AccountName = "Customer1",
                    AccountEmail = "customer1@example.com",
                    AccountPhoneNumber = "2222222222",
                    AccountPassword = "pass",
                    AccountGender = "Female",
                    AccountDob = new DateTime(1990, 1, 1),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    AccountAddress = "Customer Address",
                    AccountImage = "customer.jpg",
                    AccountLoyaltyPoint = 20,
                    AccountIsDeleted = false,
                    RoleId = "user"
                }
            );
            await _context.SaveChangesAsync();

            var response = await _repository.GetAllCustomerAccount();

            Assert.True(response.Flag);
            Assert.Equal("Customer accounts retrieved successfully", response.Message);
            var list = response.Data as List<GetAccountDTO>;
            Assert.NotNull(list);
            Assert.Single(list);
        }

        [Fact]
        public async Task GetDeletedAccounts_ReturnsResponseWithData_WhenDeletedAccountsExist()
        {
            _context.Accounts.AddRange(
                new Account
                {
                    AccountId = Guid.NewGuid(),
                    AccountName = "DeletedUser",
                    AccountEmail = "deleted@example.com",
                    AccountPhoneNumber = "0000000000",
                    AccountPassword = "pass",
                    AccountGender = "Male",
                    AccountDob = new DateTime(1980, 1, 1),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    AccountAddress = "Deleted Address",
                    AccountImage = "deleted.jpg",
                    AccountLoyaltyPoint = 0,
                    AccountIsDeleted = true,
                    RoleId = "User"
                }
            );
            await _context.SaveChangesAsync();

            var response = await _repository.GetDeletedAccounts();

            Assert.True(response.Flag);
            Assert.Equal("Deleted accounts retrieved successfully", response.Message);
            var list = response.Data as List<GetAccountDTO>;
            Assert.NotNull(list);
            Assert.Single(list);
        }

        [Fact]
        public async Task GetActiveAccounts_ReturnsResponseWithData_WhenActiveAccountsExist()
        {
            _context.Accounts.AddRange(
                new Account
                {
                    AccountId = Guid.NewGuid(),
                    AccountName = "ActiveUser",
                    AccountEmail = "active@example.com",
                    AccountPhoneNumber = "3333333333",
                    AccountPassword = "pass",
                    AccountGender = "Female",
                    AccountDob = new DateTime(1995, 3, 3),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    AccountAddress = "Active Address",
                    AccountImage = "active.jpg",
                    AccountLoyaltyPoint = 120,
                    AccountIsDeleted = false,
                    RoleId = "User"
                }
            );
            await _context.SaveChangesAsync();

            var response = await _repository.GetActiveAccounts();

            Assert.True(response.Flag);
            Assert.Equal("Active accounts retrieved successfully", response.Message);
            var list = response.Data as List<GetAccountDTO>;
            Assert.NotNull(list);
            Assert.Single(list);
        }
        #endregion

        #region Login

        [Fact]
        public async Task Login_ReturnsToken_WhenCredentialsAreValid()
        {
            string plainPassword = "password123";
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "LoginUser",
                AccountEmail = "login@example.com",
                AccountPhoneNumber = "111222333",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword),
                AccountGender = "Male",
                AccountDob = new DateTime(1990, 1, 1),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Login Address",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 100,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDTO(account.AccountEmail, plainPassword);

            var response = await _repository.Login(loginDto);

            Assert.True(response.Flag);
            Assert.Equal("Login successfully!", response.Message);
            Assert.NotNull(response.Data);
        }

        [Fact]
        public async Task Login_ReturnsWrongPassword_WhenCredentialsAreInvalid()
        {
            string plainPassword = "password123";
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "LoginUser2",
                AccountEmail = "login2@example.com",
                AccountPhoneNumber = "444555666",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword),
                AccountGender = "Female",
                AccountDob = new DateTime(1991, 2, 2),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address2",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 50,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDTO(account.AccountEmail, "wrongPassword");

            var response = await _repository.Login(loginDto);

            Assert.False(response.Flag);
            Assert.Equal("Wrong password!", response.Message);
        }

        #endregion

        #region Register

        [Fact]
        public async Task Register_ReturnsSuccess_WhenNewAccount()
        {
            var fileContent = "Fake image content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(fileContent));
            var formFile = new FormFile(stream, 0, stream.Length, "ImageFile", "test.png");

            var uploadModel = new ImageUploadModel(formFile);

            var registerTempDTO = new RegisterDTO(
                AccountName: "RegisterUser",
                AccountEmail: "register@example.com",
                AccountPhoneNumber: "777888999",
                AccountPassword: "registerpass",
                AccountGender: "Male",
                AccountDob: new DateTime(1995, 5, 5),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Register Address",
                AccountImage: "image.jpg"
            );

            var registerAccountDTO = new RegisterAccountDTO(uploadModel, registerTempDTO);

            var response = await _repository.Register(registerAccountDTO);

            Assert.True(response.Flag);
            Assert.Equal("Account registered successfully", response.Message);

            var imagesPath = Path.Combine(_hostingEnvironment.ContentRootPath, "images");
            Assert.True(Directory.Exists(imagesPath));
        }

        [Fact]
        public async Task Register_ReturnsEmailAlreadyExists_WhenDuplicateEmail()
        {
            var existingAccount = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "Existing User",
                AccountEmail = "duplicate@example.com",
                AccountPhoneNumber = "1111111111",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword("pass"),
                AccountGender = "Male",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 10,
                AccountIsDeleted = false,
                RoleId = "user"
            };
            _context.Accounts.Add(existingAccount);
            await _context.SaveChangesAsync();

            var registerTempDTO = new RegisterDTO(
                AccountName: "New User",
                AccountEmail: "duplicate@example.com",
                AccountPhoneNumber: "2222222222",
                AccountPassword: "newpass",
                AccountGender: "Female",
                AccountDob: new DateTime(1996, 6, 6),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "New Address",
                AccountImage: "new.jpg"
            );

            var registerAccountDTO = new RegisterAccountDTO(null, registerTempDTO);

            var response = await _repository.Register(registerAccountDTO);

            Assert.False(response.Flag);
            Assert.Equal("Email already exists!", response.Message);
        }

        #endregion

        #region AddAccount

        [Fact]
        public async Task AddAccount_ReturnsSuccess_WhenNewAccount()
        {
            var fileContent = "Fake image content for add account";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(fileContent));
            var formFile = new FormFile(stream, 0, stream.Length, "ImageFile", "add.png");

            var uploadModel = new ImageUploadModel(formFile);

            var registerTempDTO = new RegisterDTO(
                AccountName: "AddAccountUser",
                AccountEmail: "addaccount@example.com",
                AccountPhoneNumber: "333444555",
                AccountPassword: "addpass",
                AccountGender: "Female",
                AccountDob: new DateTime(1993, 3, 3),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Add Address",
                AccountImage: "add.jpg"
            );

            var registerAccountDTO = new RegisterAccountDTO(uploadModel, registerTempDTO);

            var response = await _repository.AddAccount(registerAccountDTO);

            Assert.True(response.Flag);
            Assert.Equal("Account registered successfully", response.Message);
        }

        [Fact]
        public async Task AddAccount_ReturnsEmailExisted_WhenDuplicateEmail()
        {
            var existingAccount = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "Existing",
                AccountEmail = "addduplicate@example.com",
                AccountPhoneNumber = "666777888",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword("pass"),
                AccountGender = "Male",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Addr",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 20,
                AccountIsDeleted = false,
                RoleId = "user"
            };
            _context.Accounts.Add(existingAccount);
            await _context.SaveChangesAsync();

            var registerTempDTO = new RegisterDTO(
                AccountName: "New AddAccount",
                AccountEmail: "addduplicate@example.com",
                AccountPhoneNumber: "999888777",
                AccountPassword: "newpass",
                AccountGender: "Female",
                AccountDob: new DateTime(1994, 4, 4),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "New Addr",
                AccountImage: "new.jpg"
            );

            var registerAccountDTO = new RegisterAccountDTO(null, registerTempDTO);

            var response = await _repository.AddAccount(registerAccountDTO);

            Assert.False(response.Flag);
            Assert.Equal("Email existed!", response.Message);
        }

        #endregion

        #region UpdateAccount

        [Fact]
        public async Task UpdateAccount_ReturnsSuccess_WhenAccountUpdated()
        {
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "Old Name",
                AccountEmail = "update@example.com",
                AccountPhoneNumber = "000111222",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword("oldpass"),
                AccountGender = "Male",
                AccountDob = new DateTime(1990, 1, 1),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Old Address",
                AccountImage = "old.jpg",
                AccountLoyaltyPoint = 100,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var fileContent = "New image content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(fileContent));
            var formFile = new FormFile(stream, 0, stream.Length, "ImageFile", "new.png");
            var uploadModel = new ImageUploadModel(formFile);

            var updateAccountDTO = new UpdateAccountDTO(
                AccountId: account.AccountId ?? Guid.Empty,
                AccountName: "New Name",
                AccountEmail: "newupdate@example.com",
                AccountPhoneNumber: "333444555",
                AccountGender: "Female",
                AccountDob: new DateTime(1995, 5, 5),
                CreatedAt: account.CreatedAt,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "New Address",
                AccountImage: "new.jpg",
                isPickImage: true,
                RoleId: "User"
            );

            var addAccountModel = new AddAccount(uploadModel, updateAccountDTO);

            var response = await _repository.UpdateAccount(addAccountModel);

            Assert.True(response.Flag);
            Assert.Contains("updated", response.Message, StringComparison.OrdinalIgnoreCase);

            var updated = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == account.AccountId);
            Assert.NotNull(updated);
            Assert.Equal("New Name", updated.AccountName);
            Assert.Equal("newupdate@example.com", updated.AccountEmail);
        }

        [Fact]
        public async Task UpdateAccount_ReturnsNotFound_WhenAccountDoesNotExist()
        {
            var nonExistentId = Guid.NewGuid();
            var updateAccountDTO = new UpdateAccountDTO(
                AccountId: nonExistentId,
                AccountName: "Name",
                AccountEmail: "nonexistent@example.com",
                AccountPhoneNumber: "0000000000",
                AccountGender: "Male",
                AccountDob: DateTime.UtcNow,
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Addr",
                AccountImage: "img.jpg",
                isPickImage: false,
                RoleId: "User"
            );

            var addAccountModel = new AddAccount(null, updateAccountDTO);

            var response = await _repository.UpdateAccount(addAccountModel);

            Assert.False(response.Flag);
            Assert.Equal("Account does not exist!", response.Message);
        }
        #endregion

        #region LoadImage

        [Fact]
        public async Task LoadImage_Valid_ReturnsFileContentResult()
        {
            string fileName = "testimage.jpg";
            string imagesPath = Path.Combine(_hostingEnvironment.ContentRootPath, "images");
            Directory.CreateDirectory(imagesPath);
            string filePath = Path.Combine(imagesPath, fileName);

            byte[] fileContent = Encoding.UTF8.GetBytes("FakeImageContent");
            await File.WriteAllBytesAsync(filePath, fileContent);

            var response = await _repository.LoadImage(fileName);

            Assert.True(response.Flag);
            Assert.Equal("User updated without image successfully", response.Message);
            var fileResult = Assert.IsType<FileContentResult>(response.Data);
            Assert.Equal(fileContent, fileResult.FileContents);
            Assert.Equal("image/jpeg", fileResult.ContentType);
        }

        [Fact]
        public async Task LoadImage_FileNotFound_ReturnsErrorResponse()
        {
            string fileName = "nonexistent.jpg";
            string imagesPath = Path.Combine(_hostingEnvironment.ContentRootPath, "images");
            Directory.CreateDirectory(imagesPath);
            var response = await _repository.LoadImage(fileName);
            Assert.False(response.Flag);
            Assert.Contains("Image file not found", response.Message);
        }
        #endregion

        #region ChangePassword

        [Fact]
        public async Task ChangePassword_ReturnsSuccess_WhenPasswordChanged()
        {
            string oldPassword = "oldPassword";
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "ChangePassUser",
                AccountEmail = "changepass@example.com",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword(oldPassword),
                AccountPhoneNumber = "123456789",
                AccountGender = "Male",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 50,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var changePasswordDTO = new ChangePasswordDTO(
                CurrentPassword: oldPassword,
                NewPassword: "newPassword",
                ConfirmPassword: "newPassword"
            );

            var response = await _repository.ChangePassword(account.AccountId ?? Guid.Empty, changePasswordDTO);

            Assert.True(response.Flag);
            Assert.Equal("Password changed successfully", response.Message);

            var updated = await _context.Accounts.FindAsync(account.AccountId);
            Assert.True(BCrypt.Net.BCrypt.Verify("newPassword", updated.AccountPassword));
        }

        [Fact]
        public async Task ChangePassword_ReturnsError_WhenAccountNotFound()
        {
            var changePasswordDTO = new ChangePasswordDTO("any", "new", "new");
            var response = await _repository.ChangePassword(Guid.NewGuid(), changePasswordDTO);
            Assert.False(response.Flag);
            Assert.Equal("Account not found", response.Message);
        }

        [Fact]
        public async Task ChangePassword_ReturnsError_WhenCurrentPasswordIncorrect()
        {
            string correctPassword = "correctPass";
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "WrongPassUser",
                AccountEmail = "wrongpass@example.com",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword(correctPassword),
                AccountPhoneNumber = "111222333",
                AccountGender = "Female",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 50,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var changePasswordDTO = new ChangePasswordDTO(
                CurrentPassword: "wrongPass",
                NewPassword: "newPass",
                ConfirmPassword: "newPass"
            );

            var response = await _repository.ChangePassword(account.AccountId ?? Guid.Empty, changePasswordDTO);

            Assert.False(response.Flag);
            Assert.Equal("Current password is incorrect", response.Message);
        }

        [Fact]
        public async Task ChangePassword_ReturnsError_WhenNewPasswordsDoNotMatch()
        {
            string currentPassword = "currentPass";
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "MismatchPassUser",
                AccountEmail = "mismatch@example.com",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword(currentPassword),
                AccountPhoneNumber = "444555666",
                AccountGender = "Male",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 50,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var changePasswordDTO = new ChangePasswordDTO(
                CurrentPassword: currentPassword,
                NewPassword: "newPass1",
                ConfirmPassword: "newPass2"
            );

            var response = await _repository.ChangePassword(account.AccountId ?? Guid.Empty, changePasswordDTO);

            Assert.False(response.Flag);
            Assert.Equal("New password and confirm password do not match", response.Message);
        }

        #endregion

        #region ForgotPassword & SendPasswordResetEmail

        [Fact]
        public async Task ForgotPassword_ReturnsEmailSent_WhenAccountExists()
        {
            string plainPassword = "oldPass";
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "ForgotPassUser",
                AccountEmail = "forgot@example.com",
                AccountPhoneNumber = "777888999",
                AccountPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword),
                AccountGender = "Female",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "default.jpg",
                AccountLoyaltyPoint = 20,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            A.CallTo(() => _emailRepository.SendMail(A<MailContent>._))
                .Returns(Task.CompletedTask);

            var response = await _repository.ForgotPassword(account.AccountEmail);

            Assert.True(response.Flag);
            Assert.Equal("A new password has been sent to your email.", response.Message);

            var updated = await _context.Accounts.FindAsync(account.AccountId);
            Assert.NotEqual(BCrypt.Net.BCrypt.HashPassword(plainPassword), updated.AccountPassword);
        }

        [Fact]
        public async Task ForgotPassword_ReturnsGenericMessage_WhenAccountNotFound()
        {
            string nonExistentEmail = "nonexistent@example.com";
            var response = await _repository.ForgotPassword(nonExistentEmail);

            Assert.False(response.Flag);
            Assert.Equal("If the account exists, a password reset email has been sent.", response.Message);
        }

        #endregion

        #region DeleteAccount

        [Fact]
        public async Task DeleteAccount_SoftDeletes_WhenAccountIsActive()
        {
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "DeleteUser",
                AccountEmail = "delete@example.com",
                AccountIsDeleted = false,
                AccountPhoneNumber = "123",
                AccountPassword = "pass",
                AccountGender = "Male",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "img.jpg",
                AccountLoyaltyPoint = 0,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var response = await _repository.DeleteAccount(account.AccountId ?? Guid.Empty);

            Assert.True(response.Flag);
            Assert.Equal("Account marked as deleted (soft delete).", response.Message);

            var updated = await _context.Accounts.FindAsync(account.AccountId);
            Assert.True(updated.AccountIsDeleted);
        }

        [Fact]
        public async Task DeleteAccount_HardDeletes_WhenAccountAlreadyDeleted()
        {
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "DeleteUser2",
                AccountEmail = "delete2@example.com",
                AccountIsDeleted = true,
                AccountPhoneNumber = "456",
                AccountPassword = "pass",
                AccountGender = "Female",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "img2.jpg",
                AccountLoyaltyPoint = 0,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var response = await _repository.DeleteAccount(account.AccountId ?? Guid.Empty);

            Assert.True(response.Flag);
            Assert.Equal("Account permanently deleted (hard delete).", response.Message);

            var deleted = await _context.Accounts.FindAsync(account.AccountId);
            Assert.Null(deleted);
        }

        [Fact]
        public async Task DeleteAccount_ReturnsNull_WhenAccountNotFound()
        {
            var response = await _repository.DeleteAccount(Guid.NewGuid());

            Assert.Null(response);
        }

        #endregion

        #region GetAccountByPhone & UpdateAccountPoint

        [Fact]
        public async Task GetAccountByPhone_ReturnsDTO_WhenFound()
        {
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "PhoneUser",
                AccountEmail = "phone@example.com",
                AccountPhoneNumber = "999888777",
                AccountPassword = "pass",
                AccountGender = "Male",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "img.jpg",
                AccountLoyaltyPoint = 10,
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var result = await _repository.GetAccountByPhone("999888777");

            Assert.NotNull(result);
            Assert.Equal("PhoneUser", result.AccountName);
        }

        [Fact]
        public async Task GetAccountByPhone_ReturnsNull_WhenNotFound()
        {
            var result = await _repository.GetAccountByPhone("0000000000");

            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateAccountPoint_ReturnsSuccess_WhenUpdated()
        {
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                AccountName = "PointUser",
                AccountEmail = "point@example.com",
                AccountLoyaltyPoint = 50,
                AccountPhoneNumber = "123",
                AccountPassword = "pass",
                AccountGender = "Male",
                AccountDob = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AccountAddress = "Address",
                AccountImage = "img.jpg",
                AccountIsDeleted = false,
                RoleId = "User"
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var response = await _repository.UpdateAccountPoint(account.AccountId ?? Guid.Empty, 150);

            Assert.True(response.Flag);
            Assert.Equal("Point of user successfully updated", response.Message);

            var updated = await _context.Accounts.FindAsync(account.AccountId);
            Assert.Equal(150, updated.AccountLoyaltyPoint);
        }

        #endregion

        #region RefundAccountPoint

        [Fact]
        public async Task RefundAccountPoint_ReturnsError_WhenAccountNotFound()
        {
            var redeemRequest = new RedeemRequest
            {
                GiftId = Guid.NewGuid(),
                RequiredPoints = 50
            };

            var response = await _repository.RefundAccountPoint(Guid.NewGuid(), redeemRequest);

            Assert.False(response.Flag);
            Assert.Equal("The account does not exist!", response.Message);
        }

        //[Fact]
        //public async Task RefundAccountPoint_ReturnsSuccess_WhenRefunded()
        //{
        //    // Arrange: Thêm account với số điểm ban đầu
        //    var account = new Account
        //    {
        //        AccountId = Guid.NewGuid(),
        //        AccountName = "RefundUser",
        //        AccountEmail = "refund@example.com",
        //        AccountLoyaltyPoint = 100,
        //        AccountPhoneNumber = "7777777",
        //        AccountPassword = "pass",
        //        AccountGender = "Male",
        //        AccountDob = DateTime.UtcNow,
        //        CreatedAt = DateTime.UtcNow,
        //        UpdatedAt = DateTime.UtcNow,
        //        AccountAddress = "Address",
        //        AccountImage = "img.jpg",
        //        AccountIsDeleted = false,
        //        RoleId = "User"
        //    };
        //    _context.Accounts.Add(account);
        //    await _context.SaveChangesAsync();

        //    var redeemRequest = new RedeemRequest
        //    {
        //        GiftId = Guid.NewGuid(),
        //        RequiredPoints = 50
        //    };

        //    // Act
        //    var response = await _repository.RefundAccountPoint(account.AccountId!.Value, redeemRequest);

        //    // Assert
        //    Assert.True(response.Flag);
        //    Assert.Equal("Point of user successfully updated", response.Message);

        //    var updated = await _context.Accounts.FindAsync(account.AccountId);
        //    Assert.Equal(150, updated.AccountLoyaltyPoint);
        //}

        #endregion

        #region Fake HttpMessageHandler for RefundAccountPoint and RedeemPointsAsync

        private class FakeHttpMessageHandler : HttpMessageHandler
        {
            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                // Mô phỏng phản hồi thành công cho PutAsync của RefundAccountPoint
                // và cho PostAsJsonAsync của RedeemPointsAsync.
                var httpResponse = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(new Response(true, "Redeem successful"))
                };
                return Task.FromResult(httpResponse);
            }
        }

        #endregion
    }
}