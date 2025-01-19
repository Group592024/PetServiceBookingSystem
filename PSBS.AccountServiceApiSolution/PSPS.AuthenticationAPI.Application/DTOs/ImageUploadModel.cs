using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;


namespace PSPS.AccountAPI.Application.DTOs
{
    public record ImageUploadModel
    ([ValidateNever] IFormFile? ImageFile);
        
}
