
using System;
using System.ComponentModel.DataAnnotations;

namespace PetApi.Application.DTOs
{
    public record PetDTO
    {
        public Guid petId { get; set; }

        [Required]
        public string petName { get; set; }
        public bool petGender { get; set; }

        public string? petNote { get; set; }
        public string? petImage { get; set; }

        [Required]
        public DateTime dateOfBirth { get; set; }

        [Required]
        public string petWeight { get; set; }

        public string petFurType { get; set; }
        public string petFurColor { get; set; }

        public bool? isDelete { get; set; }

        [Required]
        public Guid petBreedId { get; set; }

        [Required]
        public Guid accountId { get; set; }
        public Guid? petTypeId { get; set; }

    }
}
