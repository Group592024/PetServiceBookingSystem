using System.ComponentModel.DataAnnotations;

namespace PetApi.Application.DTOs
{
    public record CreatePetTypeDTO
    (
         [Required] string PetType_Name,
         string? PetType_Description
         );

}
