using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.Application.DTOs
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
