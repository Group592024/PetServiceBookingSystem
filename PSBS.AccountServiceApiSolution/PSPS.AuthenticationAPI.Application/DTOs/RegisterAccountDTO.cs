namespace PSPS.AccountAPI.Application.DTOs
{
    public record RegisterAccountDTO(
        ImageUploadModel? UploadModel,
        RegisterDTO RegisterTempDTO
        );
}
