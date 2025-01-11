using System.ComponentModel.DataAnnotations;

namespace PetApi.Application.DTOs
{
    public record PetTypeDTO(
        Guid PetType_ID,
         [Required] string PetType_Name,
         string? PetType_Image,
         string? PetType_Description,
         bool IsDelete
         );

}
