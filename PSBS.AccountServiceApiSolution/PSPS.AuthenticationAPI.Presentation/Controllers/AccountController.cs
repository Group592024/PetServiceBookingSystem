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
        [HttpPost("register")]// Register new account
        public async Task<ActionResult<Response>> Register([FromForm] RegisterAccountDTO model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await account.Register(model); 
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
            if (result == null )
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



    }
}
