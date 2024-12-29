using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.Application.DTOs
{
    public record UpdateAccountDTO(
         string AccountGuId,
         string AccountName,
         [EmailAddress] string AccountEmail,
         string AccountPhoneNumber,
         string AccountGender,
         DateTime AccountDob,
         string AccountAddress,
         string AccountImage,
         bool isPickImage

        );
}
