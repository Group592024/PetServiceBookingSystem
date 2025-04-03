

using VoucherApi.Application.Interfaces;
using VoucherApi.Presentation.Controllers;
using FakeItEasy;
using VoucherApi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Application.DTOs;
namespace UnitTest.RewardServiceApi.Controllers
{
    public class VoucherControllerTest
    {
        private readonly IVoucher voucherInterface;
        private readonly VoucherController voucherController;

        public VoucherControllerTest()
        {
            // set up dependecies
            voucherInterface = A.Fake<IVoucher>();
            // set up System Under Test 
            voucherController = new VoucherController(voucherInterface);
        }

        // GET ALL VOUCHERS
        [Fact]
        public async Task GetVoucher_WhenVoucherExists_ReturnOKResWithVoucher()
        {
            // Arrange 
            var vouchers = new List<Voucher>()
            {
                new()
                {
                    VoucherCode = "123456",
                    IsDeleted = true,
                    IsGift = true,
                    VoucherDescription = "none",
                    VoucherQuantity = 1,
                    VoucherDiscount = 2,
                    VoucherName = "Voucher",
                    VoucherStartDate = DateTime.Now,
                    VoucherEndDate = DateTime.Now.AddDays(1),
                    VoucherId = new Guid(),
                    VoucherMaximum = 200,
                    VoucherMinimumSpend = 10
                },
                new()
                {
                    VoucherCode = "nee",
                    IsDeleted = true,
                    IsGift = true,
                    VoucherDescription = "none",
                    VoucherQuantity = 1,
                    VoucherDiscount = 2,
                    VoucherName = "Voucher",
                    VoucherStartDate = DateTime.Now,
                    VoucherEndDate = DateTime.Now.AddDays(1),
                    VoucherId = new Guid(),
                    VoucherMaximum = 200,
                    VoucherMinimumSpend = 10
                }
            };
            // set up fake response for GetAllAysync method
            A.CallTo(()=> voucherInterface.GetAllAsync()).Returns(vouchers);

            // Act

            var result = await voucherController.GetVouchers();

            // Assert

            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var returnedVouchers = okResult.Value as Response;
            returnedVouchers.Should().NotBeNull();
            var resData = returnedVouchers.Data as IEnumerable<VoucherDTO>;
            resData.Should().NotBeNull();
            resData.Should().HaveCount(2);
            resData.First().VoucherCode.Should().Be("123456");
            resData.Last().VoucherCode.Should().Be("nee");
        }

        [Fact]
        public async Task GetVoucher_WhenVoucherDoesNotExist_ReturnNotFound()
        {
            // Arrange
            A.CallTo(() => voucherInterface.GetAllAsync()).Returns(new List<Voucher>());

            // Act
            var result = await voucherController.GetVouchers();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        [Fact]
        public async Task GetVoucherById_WhenVoucherExists_ReturnOKResWithVoucher()
        {
            // Arrange
            var voucherId = Guid.NewGuid();
            var voucher = new Voucher
            {
                VoucherId = voucherId,
                VoucherCode = "testCode",
                IsDeleted = false,
                IsGift = true,
                VoucherDescription = "Test Description",
                VoucherQuantity = 5,
                VoucherDiscount = 10,
                VoucherName = "Test Voucher",
                VoucherStartDate = DateTime.Now,
                VoucherEndDate = DateTime.Now.AddDays(7),
                VoucherMaximum = 100,
                VoucherMinimumSpend = 50
            };
            A.CallTo(() => voucherInterface.GetByIdAsync(voucherId)).Returns(voucher);

            // Act
            var result = await voucherController.GetVoucherById(voucherId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var returnedVoucher = okResult.Value as Response;
            returnedVoucher.Should().NotBeNull();
            var resData = returnedVoucher.Data as VoucherDTO;
            resData.Should().NotBeNull();
            resData.voucherId.Should().Be(voucherId);
        }

        [Fact]
        public async Task GetVoucherById_WhenVoucherDoesNotExist_ReturnNotFound()
        {
            // Arrange
            var voucherId = Guid.NewGuid();
            A.CallTo(() => voucherInterface.GetByIdAsync(voucherId)).Returns(Task.FromResult<Voucher>(null));

            // Act
            var result = await voucherController.GetVoucherById(voucherId);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        [Fact]
        public async Task CreateVoucher_ValidModel_ReturnOK()
        {
            // Arrange
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 10, 5, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            var voucherEntity = new Voucher(); // Create a dummy voucher entity for conversion
            A.CallTo(() => voucherInterface.CreateAsync(A<Voucher>._)).Returns(new Response(true, "Voucher created"));
            voucherController.ModelState.Clear(); // Clear the modelstate to avoid errors

            // Act
            var result = await voucherController.CreateVoucher(voucherDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task CreateVoucher_InvalidModel_ReturnBadRequest()
        {
            // Arrange
            var voucherDto = new VoucherDTO(Guid.NewGuid(), null, "Test Desc", 10, 5, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.AddModelError("VoucherName", "VoucherName is required");

            // Act
            var result = await voucherController.CreateVoucher(voucherDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

        [Fact]
        public async Task UpdateVoucher_ValidModel_ReturnOK()
        {
            // Arrange
            var updateVoucherDto = new UpdateVoucherDTO(Guid.NewGuid(), "Updated Voucher", "Updated Desc", 15, 8, 150, 75, "UpdatedCode", DateTime.Now, DateTime.Now.AddDays(10), false, true);
            A.CallTo(() => voucherInterface.UpdateAsync(A<Voucher>._)).Returns(new Response(true, "Voucher updated"));
            voucherController.ModelState.Clear();

            // Act
            var result = await voucherController.UpdateVoucher(updateVoucherDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task UpdateVoucher_InvalidModel_ReturnBadRequest()
        {
            // Arrange
            var updateVoucherDto = new UpdateVoucherDTO(Guid.NewGuid(), null, "Updated Desc", 15, 8, 150, 75, "UpdatedCode", DateTime.Now, DateTime.Now.AddDays(10), false, true);
            voucherController.ModelState.AddModelError("VoucherName", "VoucherName is required");

            // Act
            var result = await voucherController.UpdateVoucher(updateVoucherDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

        [Fact]
        public async Task UpdateVoucherQuantity_WhenVoucherExists_ReturnOK()
        {
            // Arrange
            var voucherId = Guid.NewGuid();
            A.CallTo(() => voucherInterface.MinusVoucherQuanitty(voucherId)).Returns(new Response(true, "Quantity updated"));

            // Act
            var result = await voucherController.UpdateVoucherQuantity(voucherId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task UpdateVoucherQuantity_WhenVoucherDoesNotExist_ReturnBadRequest()
        {
            // Arrange
            var voucherId = Guid.NewGuid();
            A.CallTo(() => voucherInterface.MinusVoucherQuanitty(voucherId)).Returns(new Response(false, "Voucher not found"));

            // Act
            var result = await voucherController.UpdateVoucherQuantity(voucherId);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

        [Fact]
        public async Task DeleteVoucher_WhenVoucherExists_ReturnOK()
        {
            // Arrange
            var voucherId = Guid.NewGuid();
            var voucher = new Voucher { VoucherId = voucherId };
            A.CallTo(() => voucherInterface.GetByIdAsync(voucherId)).Returns(voucher);
            A.CallTo(() => voucherInterface.DeleteAsync(voucher)).Returns(new Response(true, "Voucher deleted"));

            // Act
            var result = await voucherController.DeleteVoucher(voucherId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task DeleteVoucher_WhenVoucherDoesNotExist_ReturnBadRequest()
        {
            // Arrange
            var voucherId = Guid.NewGuid();
            A.CallTo(() => voucherInterface.GetByIdAsync(voucherId)).Returns(Task.FromResult<Voucher>(null));
            //Since GetByIdAsync returns null, the DeleteAsync is not called in the controller, so we don't need to fake it.
            //Act
            var result = await voucherController.DeleteVoucher(voucherId);

            //Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

        [Fact]
        public async Task GetVouchersForCustomer_WhenVoucherExists_ReturnOK()
        {
            // Arrange
            var vouchers = new List<Voucher> { new Voucher() }; // Mock vouchers
            A.CallTo(() => voucherInterface.GetAllForCustomer()).Returns(vouchers);

            // Act
            var result = await voucherController.GetVouchersForCustomer();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task GetVouchersForCustomer_WhenVoucherDoesNotExist_ReturnNotFound()
        {
            // Arrange
            A.CallTo(() => voucherInterface.GetAllForCustomer()).Returns(new List<Voucher>());

            // Act
            var result = await voucherController.GetVouchersForCustomer();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        [Fact]
        public async Task GetValidVouchersForCustomer_WhenVoucherExists_ReturnOK()
        {
            // Arrange
            var vouchers = new List<Voucher> { new Voucher() }; // Mock vouchers
            A.CallTo(() => voucherInterface.GetValidVoucherForCustomer()).Returns(vouchers);

            // Act
            var result = await voucherController.GetValidVouchersForCustomer();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task GetValidVouchersForCustomer_WhenVoucherDoesNotExist_ReturnNotFound()
        {
            // Arrange
            A.CallTo(() => voucherInterface.GetValidVoucherForCustomer()).Returns(new List<Voucher>());

            // Act
            var result = await voucherController.GetValidVouchersForCustomer();

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }


        [Fact]
        public async Task CreateVoucher_ValidQuantity_ReturnOK()
        {
            // Arrange
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 10, 5, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            A.CallTo(() => voucherInterface.CreateAsync(A<Voucher>._)).Returns(new Response(true, "Voucher created"));
            voucherController.ModelState.Clear();

            // Act
            var result = await voucherController.CreateVoucher(voucherDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task CreateVoucher_QuantityZero_ReturnOK()
        {
            // Arrange
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 0, 5, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            A.CallTo(() => voucherInterface.CreateAsync(A<Voucher>._)).Returns(new Response(true, "Voucher created"));
            voucherController.ModelState.Clear();

            // Act
            var result = await voucherController.CreateVoucher(voucherDto);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task CreateVoucher_NegativeQuantity_ReturnBadRequest()
        {
            // Arrange
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", -2242, 5, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.Clear();

            // Act
            var result = await voucherController.CreateVoucher(voucherDto);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
            
      
        }


        [Fact]
        public async Task CreateVoucher_MissingVoucherName_ReturnBadRequest()
        {
            var voucherDto = new VoucherDTO(Guid.NewGuid(), null, "Test Desc", 10, 5, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.Clear();
            var result = await voucherController.CreateVoucher(voucherDto);
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
           
        }

        [Fact]
        public async Task CreateVoucher_MissingVoucherDescription_ReturnBadRequest()
        {
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", null, 10, 5, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.Clear();
            var result = await voucherController.CreateVoucher(voucherDto);
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
           
        }

        [Fact]
        public async Task CreateVoucher_NegativeVoucherDiscount_ReturnBadRequest()
        {
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 10, -1, 100, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.Clear();
            var result = await voucherController.CreateVoucher(voucherDto);
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
          
        }

        [Fact]
        public async Task CreateVoucher_NegativeVoucherMaximum_ReturnBadRequest()
        {
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 10, 5, -1, 50, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.Clear();
            var result = await voucherController.CreateVoucher(voucherDto);
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
           
        }

        [Fact]
        public async Task CreateVoucher_NegativeVoucherMinimumSpend_ReturnBadRequest()
        {
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 10, 5, 100, -1, "TestCode", DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.Clear();
            var result = await voucherController.CreateVoucher(voucherDto);
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
       
        }

        [Fact]
        public async Task CreateVoucher_MissingVoucherCode_ReturnBadRequest()
        {
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 10, 5, 100, 50, null, DateTime.Now, DateTime.Now.AddDays(7), true, false);
            voucherController.ModelState.Clear();
            var result = await voucherController.CreateVoucher(voucherDto);
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
           
        }

        [Fact]
        public async Task CreateVoucher_EndDateBeforeStartDate_ReturnBadRequest()
        {
            var voucherDto = new VoucherDTO(Guid.NewGuid(), "Test Voucher", "Test Desc", 10, 5, 100, 50, "TestCode", DateTime.Now.AddDays(7), DateTime.Now, true, false);
            voucherController.ModelState.Clear();
            var result = await voucherController.CreateVoucher(voucherDto);
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
           
        }

     
    

    }
}
