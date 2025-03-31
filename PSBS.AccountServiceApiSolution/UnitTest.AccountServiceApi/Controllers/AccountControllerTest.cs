using FakeItEasy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace UnitTest.AccountServiceApi.Controllers
{
    public class AccountControllerTest
    {
        private readonly IAccount account;
        private readonly AccountController accountController;

        public AccountControllerTest()
        {
            account = A.Fake<IAccount>();
            accountController = new AccountController(account);
        }

        #region RedeemPoints Tests

        [Fact]
        public async Task RedeemPoints_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            var redeemRequest = new RedeemRequest
            {
                GiftId = Guid.NewGuid(),
                RequiredPoints = 100
            };
            var expectedResponse = new Response(true, "Redeem successful");
            A.CallTo(() => account.RedeemPointsAsync(accountId, redeemRequest))
                .Returns(Task.FromResult(expectedResponse));
            var result = await accountController.RedeemPoints(accountId, redeemRequest);
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task RedeemPoints_InvalidModel_ReturnsBadRequest()
        {
            Guid accountId = Guid.NewGuid();
            var redeemRequest = new RedeemRequest();
            accountController.ModelState.AddModelError("Error", "Invalid");
            var result = await accountController.RedeemPoints(accountId, redeemRequest);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        #endregion

        #region Register Tests

        [Fact]
        public async Task Register_Valid_ReturnsOkResult()
        {
            var fakeFile = A.Fake<IFormFile>(); 
            var uploadModel = new ImageUploadModel(fakeFile);

            var registerTempDTO = new RegisterDTO(
                AccountName: "Test User",
                AccountEmail: "test@example.com",
                AccountPhoneNumber: "0123456789",
                AccountPassword: "password123",
                AccountGender: "Male",
                AccountDob: new DateTime(1990, 1, 1),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Address",
                AccountImage: "image.jpg"
            );

            var registerDto = new RegisterAccountDTO(uploadModel, registerTempDTO);

            var expectedResponse = new Response(true, "Register successful");
            A.CallTo(() => account.Register(registerDto))
                .Returns(Task.FromResult(expectedResponse));

            var actionResult = await accountController.Register(registerDto);

            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task Register_InvalidModel_ReturnsBadRequest()
        {
            var registerDto = new RegisterAccountDTO(null, null);
            accountController.ModelState.AddModelError("Error", "Invalid");

            var actionResult = await accountController.Register(registerDto);

            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }

        #endregion

        #region AddAccount Tests

        [Fact]
        public async Task AddAccount_Valid_ReturnsOkResult()
        {
            var fakeFile = A.Fake<IFormFile>();
            var uploadModel = new ImageUploadModel(fakeFile); 
            var registerTempDTO = new RegisterDTO(
                AccountName: "New User",
                AccountEmail: "new@example.com",
                AccountPhoneNumber: "0987654321",
                AccountPassword: "newpassword",
                AccountGender: "Female",
                AccountDob: new DateTime(1995, 5, 5),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "New Address",
                AccountImage: "newimage.jpg"
            );
            var registerDto = new RegisterAccountDTO(uploadModel, registerTempDTO);
            var expectedResponse = new Response(true, "Add account successful");
            A.CallTo(() => account.AddAccount(registerDto))
                .Returns(Task.FromResult(expectedResponse));

            var actionResult = await accountController.AddAccount(registerDto);

            
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task AddAccount_InvalidModel_ReturnsBadRequest()
        {
            var registerDto = new RegisterAccountDTO(null, null);
            accountController.ModelState.AddModelError("Error", "Invalid");

            var actionResult = await accountController.AddAccount(registerDto);

            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }

        #endregion

        #region Login Tests

        [Fact]
        public async Task Login_Valid_ReturnsOkResult()
        {
            var loginDto = new LoginDTO("test@example.com", "password123");
            var expectedResponse = new Response(true, "Login successful");
            A.CallTo(() => account.Login(loginDto))
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await accountController.Login(loginDto);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task Login_InvalidModel_ReturnsBadRequest()
        {
            var loginDto = new LoginDTO("", "");
            accountController.ModelState.AddModelError("Error", "Invalid");
            var actionResult = await accountController.Login(loginDto);
            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }


        #endregion

        #region GetAccount Tests

        [Fact]
        public async Task GetAccount_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            var expectedAccount = new GetAccountDTO(
                AccountId: accountId,
                AccountName: "Test User",
                AccountEmail: "test@example.com",
                AccountPhoneNumber: "0123456789",
                AccountPassword: "password123",
                AccountGender: "Male",
                AccountDob: new DateTime(1990, 1, 1),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Address",
                AccountImage: "image.jpg",
                AccountLoyaltyPoint: 100,
                AccountIsDeleted: false,
                RoleId: "User"
            );
            A.CallTo(() => account.GetAccount(accountId))
                .Returns(Task.FromResult(expectedAccount));

            var actionResult = await accountController.GetAccount(accountId);

            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedAccount, okResult.Value);
        }

        [Fact]
        public async Task GetAccount_NotFound_ReturnsNotFound()
        {
            Guid accountId = Guid.NewGuid();
            A.CallTo(() => account.GetAccount(accountId))
                .Returns(Task.FromResult<GetAccountDTO>(null));

            var actionResult = await accountController.GetAccount(accountId);

            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        #endregion

        #region GetAllAccount Tests

        [Fact]
        public async Task GetAllAccount_ReturnsOkResult()
        {
            var accountList = new List<GetAccountDTO>
    {
        new GetAccountDTO(
            AccountId: Guid.NewGuid(),
            AccountName: "User1",
            AccountEmail: "user1@example.com",
            AccountPhoneNumber: "0123456789",
            AccountPassword: "pass1",
            AccountGender: "Male",
            AccountDob: new DateTime(1990, 1, 1),
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow,
            AccountAddress: "Address 1",
            AccountImage: "img1.jpg",
            AccountLoyaltyPoint: 50,
            AccountIsDeleted: false,
            RoleId: "User"
        ),
        new GetAccountDTO(
            AccountId: Guid.NewGuid(),
            AccountName: "User2",
            AccountEmail: "user2@example.com",
            AccountPhoneNumber: "0987654321",
            AccountPassword: "pass2",
            AccountGender: "Female",
            AccountDob: new DateTime(1992, 2, 2),
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow,
            AccountAddress: "Address 2",
            AccountImage: "img2.jpg",
            AccountLoyaltyPoint: 70,
            AccountIsDeleted: false,
            RoleId: "User"
        )
    };
            var expectedResponse = new Response(true, "Accounts found") { Data = accountList };

            A.CallTo(() => account.GetAllAccount())
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await accountController.GetAllAccount();
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task GetAllAccount_NotFound_ReturnsNotFound()
        {
            A.CallTo(() => account.GetAllAccount())
                .Returns(Task.FromResult<Response>(null));
            var actionResult = await accountController.GetAllAccount();
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }
        #endregion

        #region GetDeletedAccounts Tests

        [Fact]
        public async Task GetDeletedAccounts_ReturnsOkResult()
        {
            var deletedAccounts = new List<GetAccountDTO>
    {
        new GetAccountDTO(
            AccountId: Guid.NewGuid(),
            AccountName: "DeletedUser",
            AccountEmail: "deleted@example.com",
            AccountPhoneNumber: "0000000000",
            AccountPassword: "pass",
            AccountGender: "Male",
            AccountDob: new DateTime(1980, 1, 1),
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow,
            AccountAddress: "Deleted Address",
            AccountImage: "deleted.jpg",
            AccountLoyaltyPoint: 0,
            AccountIsDeleted: true,
            RoleId: "User"
        )
    };

            var expectedResponse = new Response(true, "Deleted accounts found")
            {
                Data = deletedAccounts
            };

            A.CallTo(() => account.GetDeletedAccounts())
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await accountController.GetDeletedAccounts();
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task GetDeletedAccounts_NotFound_ReturnsNotFound()
        {
            A.CallTo(() => account.GetDeletedAccounts())
                .Returns(Task.FromResult<Response>(null));
            var actionResult = await accountController.GetDeletedAccounts();
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        #endregion

        #region GetActiveAccounts Tests

        [Fact]
        public async Task GetActiveAccounts_ReturnsOkResult()
        {
            var activeAccounts = new List<GetAccountDTO>
    {
        new GetAccountDTO(
            AccountId: Guid.NewGuid(),
            AccountName: "ActiveUser",
            AccountEmail: "active@example.com",
            AccountPhoneNumber: "1111111111",
            AccountPassword: "pass",
            AccountGender: "Female",
            AccountDob: new DateTime(1995,3,3),
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow,
            AccountAddress: "Active Address",
            AccountImage: "active.jpg",
            AccountLoyaltyPoint: 120,
            AccountIsDeleted: false,
            RoleId: "User"
        )
    };
            var expectedResponse = new Response(true, "Active accounts found")
            {
                Data = activeAccounts
            };
            A.CallTo(() => account.GetActiveAccounts())
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await accountController.GetActiveAccounts();
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task GetActiveAccounts_NotFound_ReturnsNotFound()
        {
            A.CallTo(() => account.GetActiveAccounts())
                .Returns(Task.FromResult<Response>(null));
            var actionResult = await accountController.GetActiveAccounts();
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }


        #endregion

        #region LoadImage Tests

        [Fact]
        public async Task LoadImage_Valid_ReturnsOkResult()
        {
            string filename = "image.jpg";
            var imageResult = new List<GetAccountDTO>
    {
        new GetAccountDTO(
            AccountId: Guid.NewGuid(),
            AccountName: "ImageUser",
            AccountEmail: "image@example.com",
            AccountPhoneNumber: "2222222222",
            AccountPassword: "pass",
            AccountGender: "Male",
            AccountDob: new DateTime(1998,4,4),
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow,
            AccountAddress: "Image Address",
            AccountImage: "image.jpg",
            AccountLoyaltyPoint: 80,
            AccountIsDeleted: false,
            RoleId: "User"
        )
    };
            var expectedResponse = new Response(true, "Image loaded successfully")
            {
                Data = imageResult
            };

            A.CallTo(() => account.LoadImage(filename))
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await accountController.LoadImage(filename);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task LoadImage_NotFound_ReturnsNotFound()
        {
            string filename = "nonexistent.jpg";
            A.CallTo(() => account.LoadImage(filename))
                .Returns(Task.FromResult<Response>(null));
            var actionResult = await accountController.LoadImage(filename);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }


        #endregion

        #region UpdateAccount Tests

        [Fact]
        public async Task UpdateAccount_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            var fakeFile = A.Fake<IFormFile>();
            var uploadModel = new ImageUploadModel(fakeFile);
            var updateAccountDTO = new UpdateAccountDTO(
                AccountId: accountId,
                AccountName: "UpdatedUser",
                AccountEmail: "updated@example.com",
                AccountPhoneNumber: "3333333333",
                AccountGender: "Female",
                AccountDob: new DateTime(1993, 6, 6),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Updated Address",
                AccountImage: "updated.jpg",
                isPickImage: true,
                RoleId: "User"
            );
            var updateModel = new AddAccount(uploadModel, updateAccountDTO);
            var expectedResponse = new Response(true, "Update successful")
            {
                Data = updateModel
            };

            A.CallTo(() => account.UpdateAccount(updateModel))
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await accountController.UpdateAccount(updateModel, accountId);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task UpdateAccount_NotFound_ReturnsNotFound()
        {
            Guid accountId = Guid.NewGuid();
            var updateAccountDTO = new UpdateAccountDTO(
                AccountId: accountId,
                AccountName: null,
                AccountEmail: null,
                AccountPhoneNumber: null,
                AccountGender: null,
                AccountDob: default,
                CreatedAt: default,
                UpdatedAt: default,
                AccountAddress: null,
                AccountImage: null,
                isPickImage: null,
                RoleId: null
            );

            var updateModel = new AddAccount(null, updateAccountDTO);
            A.CallTo(() => account.UpdateAccount(updateModel))
                .Returns(Task.FromResult<Response>(null));
            var actionResult = await accountController.UpdateAccount(updateModel, accountId);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        #endregion

        #region DeleteAccount Tests

        [Fact]
        public async Task DeleteAccount_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            var expectedResponse = new Response(true, "Delete successful");
            A.CallTo(() => account.DeleteAccount(accountId))
                .Returns(Task.FromResult(expectedResponse));
            var result = await accountController.DeleteAccount(accountId);
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task DeleteAccount_NotFound_ReturnsNotFound()
        {
            Guid accountId = Guid.NewGuid();
            A.CallTo(() => account.DeleteAccount(accountId))
                .Returns(Task.FromResult<Response>(null));
            var result = await accountController.DeleteAccount(accountId);
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion

        #region ChangePassword Tests

        [Fact]
        public async Task ChangePassword_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            var changePasswordDto = new ChangePasswordDTO(
                CurrentPassword: "oldPass",
                NewPassword: "newPass",
                ConfirmPassword: "newPass"
            );
            var expectedResponse = new Response(true, "Change password successful");
            A.CallTo(() => account.ChangePassword(accountId, changePasswordDto))
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await accountController.ChangePassword(accountId, changePasswordDto);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task ChangePassword_InvalidModel_ReturnsBadRequest()
        {
            Guid accountId = Guid.NewGuid();
            var changePasswordDto = new ChangePasswordDTO(
                CurrentPassword: null,
                NewPassword: null,
                ConfirmPassword: null
            );
            accountController.ModelState.AddModelError("Error", "Invalid");
            var actionResult = await accountController.ChangePassword(accountId, changePasswordDto);
            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }

        #endregion

        #region ForgotPassword Tests

        [Fact]
        public async Task ForgotPassword_Valid_ReturnsOkResult()
        {
            string email = "test@example.com";
            var expectedResponse = new Response(true, "Forgot password successful");
            A.CallTo(() => account.ForgotPassword(email))
                .Returns(Task.FromResult(expectedResponse));
            var result = await accountController.ForgotPassword(email);
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task ForgotPassword_NotFound_ReturnsNotFound()
        {
            string email = "notfound@example.com";
            A.CallTo(() => account.ForgotPassword(email))
                .Returns(Task.FromResult<Response>(null));
            var result = await accountController.ForgotPassword(email);
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion

        #region GetAccountChat Tests

        [Fact]
        public async Task GetAccountChat_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            var expectedAccount = new GetAccountDTO(
                AccountId: accountId,
                AccountName: "Chat User",
                AccountEmail: "chat@example.com",
                AccountPhoneNumber: "4444444444",
                AccountPassword: "pass",
                AccountGender: "Male",
                AccountDob: new DateTime(1991, 7, 7),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Chat Address",
                AccountImage: "chat.jpg",
                AccountLoyaltyPoint: 90,
                AccountIsDeleted: false,
                RoleId: "User"
            );
            A.CallTo(() => account.GetAccount(accountId))
                .Returns(Task.FromResult(expectedAccount));
            var actionResult = await accountController.GetAccountChat(accountId);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal(expectedAccount, response.Data);
        }

        [Fact]
        public async Task GetAccountChat_NotFound_ReturnsNotFound()
        {
            Guid accountId = Guid.NewGuid();
            A.CallTo(() => account.GetAccount(accountId))
                .Returns(Task.FromResult<GetAccountDTO>(null));
            var actionResult = await accountController.GetAccountChat(accountId);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        #endregion

        #region GetAccountByPhone Tests

        [Fact]
        public async Task GetAccountByPhone_Valid_ReturnsOkResult()
        {
            string phone = "5555555555";
            var expectedAccount = new GetAccountDTO(
                AccountId: Guid.NewGuid(),
                AccountName: "Phone User",
                AccountEmail: "phone@example.com",
                AccountPhoneNumber: phone,
                AccountPassword: "pass",
                AccountGender: "Female",
                AccountDob: new DateTime(1994, 8, 8),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                AccountAddress: "Phone Address",
                AccountImage: "phone.jpg",
                AccountLoyaltyPoint: 110,
                AccountIsDeleted: false,
                RoleId: "Admin"
            );
            A.CallTo(() => account.GetAccountByPhone(phone))
                .Returns(Task.FromResult(expectedAccount));
            var actionResult = await accountController.GetAccountByPhone(phone);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal(expectedAccount, response.Data);
        }

        [Fact]
        public async Task GetAccountByPhone_NotFound_ReturnsNotFound()
        {
            string phone = "0000000000";
            A.CallTo(() => account.GetAccountByPhone(phone))
                .Returns(Task.FromResult<GetAccountDTO>(null));

            var actionResult = await accountController.GetAccountByPhone(phone);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        #endregion

        #region UpdateUserPoint Tests

        [Fact]
        public async Task UpdateUserPoint_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            int point = 150;
            var expectedResponse = new Response(true, "Update point successful");
            A.CallTo(() => account.UpdateAccountPoint(accountId, point))
                .Returns(Task.FromResult(expectedResponse));

            var actionResult = await accountController.UpdateUserPoint(accountId, point);

            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        #endregion

        #region RefundUserPoint Tests

        [Fact]
        public async Task RefundUserPoint_Valid_ReturnsOkResult()
        {
            Guid accountId = Guid.NewGuid();
            var redeemRequest = new RedeemRequest
            {
                GiftId = Guid.NewGuid(),
                RequiredPoints = 50
            };
            var expectedResponse = new Response(true, "Refund successful");
            A.CallTo(() => account.RefundAccountPoint(accountId, redeemRequest))
                .Returns(Task.FromResult(expectedResponse));

            var actionResult = await accountController.RefundUserPoint(accountId, redeemRequest);

            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        #endregion
    }
}
