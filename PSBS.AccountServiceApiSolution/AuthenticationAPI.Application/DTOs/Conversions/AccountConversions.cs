using PSPS.AccountAPI.Domain.Entities;
using System.Linq;

namespace PSPS.AccountAPI.Application.DTOs.Conversions
{
    public static class AccountConversions
    {
        // Convert AccountDTO to Entity
        public static Account ToEntity(AccountDTO accountDTO) => new Account()
        {
            AccountId = accountDTO.AccountId,
            AccountName = accountDTO.AccountName,
            AccountPassword = accountDTO.AccountPassword,
            AccountEmail = accountDTO.AccountEmail,
            AccountPhoneNumber = accountDTO.AccountPhoneNumber,
            AccountAddress = accountDTO.AccountAddress,
            AccountDob = accountDTO.AccountDob,
            AccountGender = accountDTO.AccountGender,
            AccountImage = accountDTO.AccountImage,
            AccountLoyaltyPoint = accountDTO.AccountLoyaltyPoint,
            AccountIsDeleted = false,
            RoleId = accountDTO.RoleId,
        };

        // Convert Entity to AccountDTO or List<AccountDTO>
        public static (AccountDTO?, IEnumerable<AccountDTO>?) FromEntity(Account account, IEnumerable<Account>? accounts)
        {
            if (account is not null && accounts is null)
            {
                var singleAccount = new AccountDTO(
                    account.AccountId!.Value,
                    account.AccountName!,
                    account.AccountEmail!,
                    account.AccountPassword!,
                    account.AccountPhoneNumber!,
                    account.AccountAddress!,
                    account.AccountDob!.Value,
                    account.AccountGender!,
                    account.AccountImage!,
                    account.AccountLoyaltyPoint!,
                    account.AccountIsDeleted!,
                    account.RoleId!
                );
                return (singleAccount, null);
            }

            if (accounts is not null && account is null)
            {
                var _accounts = accounts.Select(a => new AccountDTO(
                    a.AccountId!.Value,
                    a.AccountName!,
                    a.AccountEmail!,
                    a.AccountPassword!,
                    a.AccountPhoneNumber!,
                    a.AccountAddress!,
                    a.AccountDob!.Value,
                    a.AccountGender!,
                    a.AccountImage!,
                    a.AccountLoyaltyPoint!,
                    a.AccountIsDeleted!,
                    a.RoleId!
                )).ToList();

                return (null, _accounts);
            }

            return (null, null);
        }

        // Convert RegisterAccountDTO to Account Entity
        public static Account ToEntity(RegisterAccountDTO registerAccountDTO) => new Account()
        {
            AccountId = Guid.NewGuid(),
            AccountName = registerAccountDTO.RegisterTempDTO.AccountName,
            AccountEmail = registerAccountDTO.RegisterTempDTO.AccountEmail,
            AccountPhoneNumber = registerAccountDTO.RegisterTempDTO.AccountPhoneNumber,
            AccountPassword = registerAccountDTO.RegisterTempDTO.AccountPassword,
            AccountGender = registerAccountDTO.RegisterTempDTO.AccountGender,
            AccountDob = registerAccountDTO.RegisterTempDTO.AccountDob,
            AccountAddress = registerAccountDTO.RegisterTempDTO.AccountAddress,
            AccountImage = registerAccountDTO.RegisterTempDTO.AccountImage,
            AccountIsDeleted = false,
            AccountLoyaltyPoint = 0, // Default value for new account
            RoleId = "user", // Assign default role if necessary
        };

        // Convert UpdateAccountDTO to Entity
        public static Account ToEntity(UpdateAccountDTO updateAccountDTO, Account existingAccount)
        {
            existingAccount.AccountName = updateAccountDTO.AccountName;
            existingAccount.AccountEmail = updateAccountDTO.AccountEmail;
            existingAccount.AccountPhoneNumber = updateAccountDTO.AccountPhoneNumber;
            existingAccount.AccountGender = updateAccountDTO.AccountGender;
            existingAccount.AccountDob = updateAccountDTO.AccountDob;
            existingAccount.AccountAddress = updateAccountDTO.AccountAddress;
            existingAccount.AccountImage = updateAccountDTO.AccountImage;
            return existingAccount;
        }

        // Convert Entity to GetAccountDTO
        public static GetAccountDTO ToGetAccountDTO(Account account) => new GetAccountDTO(
            account.AccountId!.Value,
            account.AccountName!,
            account.AccountEmail!,
            account.AccountPhoneNumber!,
            account.AccountPassword!,
            account.AccountGender!,
            account.AccountDob!.Value,
            account.AccountAddress!,
            account.AccountImage!,
            account.AccountLoyaltyPoint!,
            account.AccountIsDeleted!,
            account.RoleId!
        );

        // Convert LoginDTO to Account Entity (Validation Example)
        public static Account? FromLoginDTO(LoginDTO loginDTO, IEnumerable<Account> accounts)
        {
            return accounts.FirstOrDefault(acc =>
                acc.AccountEmail == loginDTO.AccountEmail &&
                acc.AccountPassword == loginDTO.AccountPassword
            );
        }

        // Convert LogoutDTO (Not Entity Related)
        public static bool ValidateLogoutDTO(LogoutDTO logoutDTO, IEnumerable<string> activeTokens)
        {
            return activeTokens.Contains(logoutDTO.RefreshToken);
        }

        // Convert ChangePasswordDTO to Updated Account
        public static Account ToEntity(ChangePasswordDTO changePasswordDTO, Account existingAccount)
        {
            if (existingAccount.AccountPassword != changePasswordDTO.CurrentPassword)
                throw new ArgumentException("Current password does not match.");

            if (changePasswordDTO.NewPassword != changePasswordDTO.ConfirmPassword)
                throw new ArgumentException("New password and confirmation do not match.");

            existingAccount.AccountPassword = changePasswordDTO.NewPassword;
            return existingAccount;
        }
    }
}
