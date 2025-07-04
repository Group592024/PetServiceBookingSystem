﻿
using System.ComponentModel.DataAnnotations;

namespace FacilityServiceApi.Application.DTO
{
    public record RoomDTO
    {
        public Guid roomId { get; set; }
        [Required]
        public Guid roomTypeId { get; set; }
        public string roomName { get; set; }
        public string description { get; set; }
        public string? status { get; set; }
        public string? roomImage { get; set; }
        public bool? isDeleted { get; set; }
    }
}
