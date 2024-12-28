using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace FacilityServiceApi.Domain.Entities
{
    public class ServiceVariant
    {
        [Key]
        public Guid serviceVariantId { get; set; }
        [ForeignKey("Service")]
        public Guid serviceId { get; set; }
        public decimal servicePrice {  get; set; }  
        public string serviceContent { get; set; }
        public DateTime createAt { get; set; }
        public DateTime updateAt { get; set; }
        public bool isDeleted { get; set; } 
        public Service Service { get; set; }

    }
}
