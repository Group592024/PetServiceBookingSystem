using System.ComponentModel.DataAnnotations;

namespace PetApi.Application.DTOs
{
    public record UpdatePetTypeDTO(

         [Required] string PetType_Name,
         string? PetType_Description,
         bool IsDelete
         );
}
