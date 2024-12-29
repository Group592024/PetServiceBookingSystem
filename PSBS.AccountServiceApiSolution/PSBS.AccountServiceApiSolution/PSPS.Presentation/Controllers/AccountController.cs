using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using PSPS.Application.DTOs;
using PSPS.Application.Interfaces;
using PSPS.Infrastructure.Repositories;
using PSPS.SharedLibrary.Responses;
using System;

namespace PSPS.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(IAccount account) : ControllerBase
    {
        [HttpPost("register")]// Đăng ký tài khoản người dùng mới
        public async Task<ActionResult<Response>> Register([FromForm] RegisterAccountDTO model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);// Kiểm tra tính hợp lệ của model
            var result = await account.Register(model); // Gọi phương thức Register từ repository
            return result.Flag ? Ok(result) : BadRequest(Request);// Trả về kết quả thành công hoặc lỗi
        }
        [HttpPost("Login")]// Đăng nhập người dùng
        public async Task<ActionResult<Response>> Login(LoginDTO loginDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);// Kiểm tra tính hợp lệ của model
            var result = await account.Login(loginDTO);// Gọi phương thức Login từ repository
            return result.Flag ? Ok(result) : BadRequest(Request);// Trả về kết quả thành công hoặc lỗi
        }
        [HttpGet]
        public async Task<ActionResult<GetAccountDTO>> GetAccount(string GuId)// Lấy thông tin tài khoản bằng GUID
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // Kiểm tra tính hợp lệ của model
            var result = await account.GetAccount(GuId);// Gọi phương thức GetAccount từ repository
            if (result == null)
                return NotFound(new { Message = "Account not found" });// Nếu không tìm thấy tài khoản, trả về lỗi

            return Ok(result); // Trả về thông tin tài khoản nếu tìm thấy
        }
        [HttpGet("all")]
        public async Task<ActionResult<List<GetAccountDTO>>> GetAllAccount()// Lấy tất cả các tài khoản từ cơ sở dữ liệu
        {
            var result = await account.GetAllAccount(); // Gọi phương thức GetAllAccount từ repository
            if (result == null)
                return NotFound(new { Message = "No accounts found" });// Nếu không có tài khoản, trả về lỗi

            return Ok(result); // Trả về danh sách tài khoản nếu tìm thấy
        }

        [HttpPut]
        public async Task<ActionResult<AddAccount>> UpdateAccount([FromForm] AddAccount model)// Cập nhật thông tin tài khoản người dùng
        {
            var result = await account.UpdateAccount(model);// Gọi phương thức UpdateAccount từ repository
            if (result == null)
                return NotFound(new { Message = "Account not found" });// Nếu không tìm thấy tài khoản, trả về lỗi

            return Ok(result);// Trả về thông tin tài khoản đã cập nhật
        }
        [HttpPut("ChangePassword{accountGuId}")] // Đổi mật khẩu của tài khoản người dùng
        public async Task<ActionResult<Response>> ChangePassword(string accountGuId, [FromBody] ChangePasswordDTO changePasswordDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);// Kiểm tra tính hợp lệ của model

            var result = await account.ChangePassword(accountGuId, changePasswordDTO);// Gọi phương thức ChangePassword từ repository
            return result.Flag ? Ok(result) : BadRequest(result);// Trả về kết quả thành công hoặc lỗi
        }
        [HttpPost("ForgotPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            var result = await account.ForgotPassword(email);
            if (result == null)
                return NotFound(new { Message = "Account not found" });// Nếu không tìm thấy tài khoản, trả về lỗi

            return Ok(result);// Trả về thông tin tài khoản đã cập nhật
        }



    }
}
