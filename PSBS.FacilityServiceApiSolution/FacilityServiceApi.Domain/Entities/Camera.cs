using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace FacilityServiceApi.Domain.Entities
{
    public class Camera
    {
        [Key,Column("camera_id")]
        public Guid cameraId { get; set; }
        [Column("camera_type")]
        public string cameraType { get; set; }
        [Column("camera_code")]
        public string cameraCode { get; set; }
        [Column("camera_status")]
        public string cameraStatus { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }
        [JsonIgnore]
        public virtual ICollection<RoomHistory>? RoomHistories { get; set; }

    }
}
