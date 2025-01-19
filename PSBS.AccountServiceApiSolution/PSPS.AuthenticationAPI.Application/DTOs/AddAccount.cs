using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace PSPS.AccountAPI.Application.DTOs
{
    public record AddAccount(
        [ValidateNever] ImageUploadModel? UploadModel,
        UpdateAccountDTO? AccountTempDTO
        );
   
}
