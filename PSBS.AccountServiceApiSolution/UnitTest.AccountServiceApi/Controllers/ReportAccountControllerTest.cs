using FakeItEasy;
using Microsoft.AspNetCore.Mvc;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.AccountAPI.Presentation.Controllers;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace UnitTest.AccountServiceApi.Controllers
{
    public class ReportAccountControllerTest
    {
        private readonly IAccount account;
        private readonly ReportAccountController reportAccountController;

        public ReportAccountControllerTest()
        {
            account = A.Fake<IAccount>();
            reportAccountController = new ReportAccountController(account);
        }

        [Fact]
        public async Task GetAllStaff_ReturnsOkResult()
        {
            var staffAccounts = new List<GetAccountDTO>
            {
                new GetAccountDTO(
                    AccountId: Guid.NewGuid(),
                    AccountName: "Staff1",
                    AccountEmail: "staff1@example.com",
                    AccountPhoneNumber: "1111111111",
                    AccountPassword: "pass",
                    AccountGender: "Male",
                    AccountDob: new DateTime(1985, 1, 1),
                    CreatedAt: DateTime.UtcNow,
                    UpdatedAt: DateTime.UtcNow,
                    AccountAddress: "Address1",
                    AccountImage: "img1.jpg",
                    AccountLoyaltyPoint: 10,
                    AccountIsDeleted: false,
                    RoleId: "Staff"
                )
            };

            var expectedResponse = new Response(true, "Staff accounts found")
            {
                Data = staffAccounts
            };

            A.CallTo(() => account.GetAllStaffAccount())
                .Returns(Task.FromResult(expectedResponse));
            var actionResult = await reportAccountController.GetAllStaff();
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task GetAllStaff_NotFound_ReturnsNotFound()
        {
            A.CallTo(() => account.GetAllStaffAccount())
                .Returns(Task.FromResult<Response>(null));
            var actionResult = await reportAccountController.GetAllStaff();
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        [Fact]
        public async Task GetAllCustomers_ReturnsOkResult()
        {
            var customerAccounts = new List<GetAccountDTO>
            {
                new GetAccountDTO(
                    AccountId: Guid.NewGuid(),
                    AccountName: "Customer1",
                    AccountEmail: "customer1@example.com",
                    AccountPhoneNumber: "2222222222",
                    AccountPassword: "pass",
                    AccountGender: "Female",
                    AccountDob: new DateTime(1990, 1, 1),
                    CreatedAt: DateTime.UtcNow,
                    UpdatedAt: DateTime.UtcNow,
                    AccountAddress: "Address2",
                    AccountImage: "img2.jpg",
                    AccountLoyaltyPoint: 20,
                    AccountIsDeleted: false,
                    RoleId: "Customer"
                )
            };

            var expectedResponse = new Response(true, "Customer accounts found")
            {
                Data = customerAccounts
            };

            A.CallTo(() => account.GetAllCustomerAccount())
                .Returns(Task.FromResult(expectedResponse));

            var actionResult = await reportAccountController.GetAllCustomers();
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedResponse, okResult.Value);
        }

        [Fact]
        public async Task GetAllCustomers_NotFound_ReturnsNotFound()
        {
            A.CallTo(() => account.GetAllCustomerAccount())
                .Returns(Task.FromResult<Response>(null));
            var actionResult = await reportAccountController.GetAllCustomers();
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }
    }
}
