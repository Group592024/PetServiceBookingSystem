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
        Task<Response> AddAccount([FromForm] RegisterAccountDTO model);
        Task<Response> Login(LoginDTO loginDTO);
        Task<GetAccountDTO> GetAccount(Guid AccountId);
        Task<Response> UpdateAccount([FromForm] AddAccount model);
        Task<Response> GetAllAccount();
        Task<Response> ChangePassword(Guid accountId, ChangePasswordDTO changePasswordDTO);
        Task<Response> ForgotPassword(string AccountEmail);
        Task<bool> SendPasswordResetEmail(string AccountEmail, string newPassword);
        Task<Response> DeleteAccount(Guid AccountId);
        Task<Response> LoadImage(string filename);
        Task<Response> GetActiveAccounts();
        Task<Response> GetDeletedAccounts();
        Task<Account> GetAccountByIdAsync(Guid accountId);
        Task<bool> UpdateAccountAsync(Account account);
        Task<Response> RedeemPointsAsync(Guid accountId, RedeemRequest model);
        Task<GetAccountDTO> GetAccountByPhone(string phone);
        Task<Response> GetAllStaffAccount();
        Task<Response> GetAllCustomerAccount();

        Task<Response> UpdateAccountPoint(Guid id, int point);

        Task<Response> RefundAccountPoint(Guid id, RedeemRequest model);
        Task<Response> SendNotificationEmail(Guid accountId, NotificationMessage notificationMessage);
    }
}
