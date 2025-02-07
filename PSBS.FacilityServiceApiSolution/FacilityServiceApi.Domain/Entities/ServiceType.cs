using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacilityServiceApi.Domain.Entities
{
    public class ServiceType
    {
        [Key, Column("serviceType_id")]
        public Guid serviceTypeId { get; set; }
        [Column("type_name")]
        public string typeName { get; set; }
        [Column("description")]
        public string description { get; set; }
        [Column("createAt")]
        public DateTime createAt { get; set; }
        [Column("updateAt")]
        public DateTime updateAt { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }

        public virtual ICollection<Service> Services { get; set; }

    }
}
