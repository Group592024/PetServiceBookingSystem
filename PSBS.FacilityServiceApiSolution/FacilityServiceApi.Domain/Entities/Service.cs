using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacilityServiceApi.Domain.Entities
{
    public class Service
    {
        [Key, Column("service_id")]
        public Guid serviceId { get; set; }
        [ForeignKey("ServiceType")]
        [Column("serviceType_id")]
        public Guid serviceTypeId { get; set; }
        [Column("service_name")]
        public string serviceName { get; set; }
        [Column("service_Image")]
        public string serviceImage { get; set; }
        [Column("service_description")]
        public string serviceDescription { get; set; }

        [Column("createAt")]
        public DateTime createAt { get; set; }
        [Column("updateAt")]
        public DateTime updateAt { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }

        public virtual ServiceType? ServiceType { get; set; }

    }
}
