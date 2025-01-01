using Microsoft.AspNetCore.Http;


namespace PSPS.AccountAPI.Application.DTOs
{
    public record ImageUploadModel
    (IFormFile ImageFile);
        
}
