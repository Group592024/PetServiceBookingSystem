using Microsoft.AspNetCore.Mvc;
using PSPS.AccountAPI.Application.DTOs;
using PSPS.AccountAPI.Domain.Entities;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;


namespace PSPS.AccountAPI.Application.Interfaces
{
    public interface IAccount : IGenericInterface<Account>
    {
        Task<Response> Register([FromForm] RegisterAccountDTO model);
        Task<Response> Login(LoginDTO loginDTO);
        Task<GetAccountDTO> GetAccount(Guid AccountId);
        Task<Response> UpdateAccount([FromForm] AddAccount model);
        Task<Response> GetAllAccount();
        Task<Response> ChangePassword(Guid accountId, ChangePasswordDTO changePasswordDTO);
        Task<Response> ForgotPassword(string AccountEmail);
        Task<bool> SendPasswordResetEmail(string AccountEmail, string newPassword);

    }
}
