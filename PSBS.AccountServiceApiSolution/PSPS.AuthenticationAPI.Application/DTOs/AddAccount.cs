namespace PSPS.AccountAPI.Application.DTOs
{
    public record AddAccount(
        ImageUploadModel UploadModel,
        UpdateAccountDTO AccountTempDTO
        );
   
}
