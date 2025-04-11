using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FacilityServiceApi.Domain.Entities
{
    public class Camera
    {
        [Key, Column("camera_id")]
        public Guid cameraId { get; set; }

        [Required(ErrorMessage = "Camera type is required")]
        [Column("camera_type")]
        public string cameraType { get; set; }

        [Required(ErrorMessage = "Camera code is required")]
        [Column("camera_code")]
        public string cameraCode { get; set; }

        [Column("camera_status")]
        public string cameraStatus { get; set; }

        [Required(ErrorMessage = "RTSP URL is required")]
        [Column("rtspurl")]
        [RegularExpression(
            @"^rtsp:\/\/(?:[a-zA-Z0-9-]+\.?)+(?::\d+)?(?:\/[^\s]*)?$", 
            ErrorMessage = "Invalid RTSP URL format. Must start with rtsp:// and follow standard URL format")]
        public string rtspUrl { get; set; }

        [Column("camera_address")]
        public string cameraAddress { get; set; }

        [Column("isDeleted")]
        public bool isDeleted { get; set; }

        [JsonIgnore]
        public virtual ICollection<RoomHistory>? RoomHistories { get; set; }
    }
}