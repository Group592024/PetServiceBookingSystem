using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace FacilityServiceApi.Domain.Entities
{
    public class ServiceVariant
    {
        [Key, Column("serviceVariant_id")]
        public Guid serviceVariantId { get; set; }
        [ForeignKey("Service")]
        [Column("service_id")]
        public Guid serviceId { get; set; }
        [Column("service_price")]
        public decimal servicePrice { get; set; }
        [Column("service_content")]
        public string serviceContent { get; set; }
        [Column("createAt")]
        public DateTime createAt { get; set; }
        [Column("updateAt")]
        public DateTime updateAt { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }
        public virtual Service? Service { get; set; }
        [JsonIgnore]
        public virtual ICollection<BookingServiceItem>? BookingServiceItems { get; set; }

    }
}
