
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Application.Interfaces;

namespace PSPS.AccountAPI.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ReportAccountController(IAccount account) : ControllerBase
    {

        [HttpGet("countStaff")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<List<GetAccountDTO>>> GetAllStaff()
        {
            var result = await account.GetAllStaffAccount();
            if (result == null)
                return NotFound(new { Message = "No accounts found" });

            return Ok(result);
        }

        [HttpGet("countCustomer")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<List<GetAccountDTO>>> GetAllCustomers()
        {
            var result = await account.GetAllCustomerAccount();
            if (result == null)
                return NotFound(new { Message = "No accounts found" });

            return Ok(result);
        }

        [HttpGet("countCustomers")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<List<GetAccountDTO>>> GetAllCustomerAccount()
        {
            var result = await account.GetAllCustomerAccounts();
            if (result == null)
                return NotFound(new { Message = "No accounts found" });

            return Ok(result);
        }
    }
}
