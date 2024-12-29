using Microsoft.AspNetCore.Mvc;
using PSPS.Application.DTOs;
using PSPS.SharedLibrary.Responses;


namespace PSPS.Application.Interfaces
{
    public interface IAccount
    {
        Task<Response> Register([FromForm] RegisterAccountDTO model);
        Task<Response> Login(LoginDTO loginDTO);
        Task<GetAccountDTO> GetAccount(string AccountGuId);
        Task<Response> UpdateAccount([FromForm] AddAccount model);
        Task<Response> GetAllAccount();
        Task<Response> ChangePassword(string accountGuId, ChangePasswordDTO changePasswordDTO);
        Task<Response> ForgotPassword(string AccountEmail);
        Task<bool> SendPasswordResetEmail(string AccountEmail, string newPassword);

    }
}
