using System;
using System.ComponentModel.DataAnnotations;


namespace PSPS.AccountAPI.Application.DTOs
{
    public record RegisterDTO
    (   
        string AccountName,
        [EmailAddress] string AccountEmail,
        string AccountPhoneNumber,
        string AccountPassword,
        string AccountGender,
        DateTime AccountDob,
        string AccountAddress,
        string AccountImage
        
        );
}
