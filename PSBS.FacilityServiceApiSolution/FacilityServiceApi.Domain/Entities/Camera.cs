using System.ComponentModel.DataAnnotations;


namespace FacilityServiceApi.Domain.Entities
{
    public class Camera
    {
        [Key]
        public Guid cameraId { get; set; }
        public string cameraType { get; set; }
        public string cameraCode { get; set; }
        public string cameraStatus { get; set; }
        public bool isDeleted { get; set; }

    }
}
