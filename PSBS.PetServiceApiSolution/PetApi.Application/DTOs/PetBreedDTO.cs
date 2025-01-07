using System;
using System.ComponentModel.DataAnnotations;

namespace PetApi.Application.DTOs
{
    public record PetBreedDTO
    {
        public Guid petBreedId { get; set; }
        [Required]
        public Guid petTypeId { get; set; }
        [Required]
        public string petBreedName { get; set; }
        public string? petBreedImage { get; set; }
        public string petBreedDescription { get; set; }
        public bool? isDelete { get; set; }
    }
}
