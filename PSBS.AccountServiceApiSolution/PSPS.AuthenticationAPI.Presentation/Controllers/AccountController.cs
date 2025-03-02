using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Application.Interfaces;
using PSPS.AccountAPI.Infrastructure.Repositories;
using PSPS.SharedLibrary.Responses;
using System;

namespace PSPS.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(IAccount account) : ControllerBase
    {
        [HttpPost("redeem-points/{accountId}")]
        public async Task<IActionResult> RedeemPoints(Guid accountId, [FromBody] RedeemRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid request"));
            }

            var response = await account.RedeemPointsAsync(accountId, model);
            if (!response.Flag)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("register")]// Register new account
        public async Task<ActionResult<Response>> Register([FromForm] RegisterAccountDTO model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await account.Register(model);
            return result.Flag ? Ok(result) : BadRequest(Request);
        }
        [HttpPost("addaccount")]// Add new account
        public async Task<ActionResult<Response>> AddAccount([FromForm] RegisterAccountDTO model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await account.AddAccount(model);
            return result.Flag ? Ok(result) : BadRequest(Request);
        }
        [HttpPost("Login")]// Login account
        public async Task<ActionResult<Response>> Login(LoginDTO loginDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await account.Login(loginDTO);
            return result.Flag ? Ok(result) : BadRequest(result);
        }
        [HttpGet]
        public async Task<ActionResult<GetAccountDTO>> GetAccount(Guid AccountId)// Get account by AccountId
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var result = await account.GetAccount(AccountId);
            if (result == null)
                return NotFound(new { Message = "Account not found" });

            return Ok(result);
        }
        [HttpGet("all")]
        public async Task<ActionResult<List<GetAccountDTO>>> GetAllAccount()// Get all account
        {
            var result = await account.GetAllAccount();
            if (result == null)
                return NotFound(new { Message = "No accounts found" });

            return Ok(result);
        }
        [HttpGet("deleted")]
        public async Task<ActionResult<List<GetAccountDTO>>> GetDeletedAccounts() // Get account by AccountIsDeleted = true
        {
            var result = await account.GetDeletedAccounts();
            if (result == null)
            {
                return NotFound(new { Message = "No deleted accounts found" });
            }

            return Ok(result);
        }

        [HttpGet("active")]
        public async Task<ActionResult<List<GetAccountDTO>>> GetActiveAccounts() // Get account by AccountIsDeleted = false
        {
            var result = await account.GetActiveAccounts();
            if (result == null)
            {
                return NotFound(new { Message = "No active accounts found" });
            }

            return Ok(result);
        }
        [HttpGet("loadImage")]
        public async Task<ActionResult<List<GetAccountDTO>>> LoadImage(string filename)// Upload image
        {
            var result = await account.LoadImage(filename);
            if (result == null)
            {
                return NotFound(new { Message = "No active accounts found" });
            }

            return Ok(result);
        }

        [HttpPut]
        public async Task<ActionResult<AddAccount>> UpdateAccount([FromForm] AddAccount model, Guid accountId)// Update account
        {
            var result = await account.UpdateAccount(model);
            if (result == null)
                return NotFound(new { Message = "Account not found" });

            return Ok(result);
        }
        [HttpDelete("delete/{accountId}")]
        public async Task<IActionResult> DeleteAccount(Guid accountId)// Delete account
        {
            var result = await account.DeleteAccount(accountId);

            if (result == null)
                return NotFound(new { Message = "Account not found" });

            return Ok(result);
        }
        [HttpPut("ChangePassword{accountId}")] // Changepassword
        public async Task<ActionResult<Response>> ChangePassword(Guid accountId, [FromBody] ChangePasswordDTO changePasswordDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var result = await account.ChangePassword(accountId, changePasswordDTO);
            return result.Flag ? Ok(result) : BadRequest(result);
        }
        [HttpPost("ForgotPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword(string email)// Forgotpassword
        {
            var result = await account.ForgotPassword(email);
            if (result == null)
                return NotFound(new { Message = "Account not found" });

            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<GetAccountDTO>> GetAccountChat(Guid id)// Get account by AccountId for chat
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var result = await account.GetAccount(id);
            if (result == null)
                return NotFound(new Response(false, "Account requested not found"));

            return Ok(new Response(true, "The Account retrieved successfully") { Data = result });

          

        }
        [HttpGet("by-phone/{phone}")]
        public async Task<ActionResult<GetAccountDTO>> GetAccountByPhone(string phone)
        {
            var result = await account.GetAccountByPhone(phone);
            if (result == null)
                return NotFound(new Response(false, "Account not found with this phone number"));

            return Ok(new Response(true, "Account with this phone number") { Data = result });
        }

        [HttpPut("UpdateUserPoint")]
        public async Task<ActionResult<Response>> UpdateUserPoint(Guid accountId,int point)
        {
            var result = await account.UpdateAccountPoint(accountId, point);
            return result.Flag ? Ok(result) : BadRequest(result);
        }


        [HttpPut("refundPoint")]
        public async Task<ActionResult<Response>> RefundUserPoint(Guid accountId, [FromBody] RedeemRequest model)
        {
            var result = await account.RefundAccountPoint(accountId, model);
            return result.Flag ? Ok(result) : BadRequest(result);
        }
    }
}
