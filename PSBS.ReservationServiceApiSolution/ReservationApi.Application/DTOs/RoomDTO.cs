using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReservationApi.Application.DTOs
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
        public bool hasCamera { get; set; }
        public bool? isDeleted { get; set; }
    }
}
