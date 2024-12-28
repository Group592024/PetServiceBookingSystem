using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Domain.Entities
{
    public class Service
    {
        [Key]
        public Guid serviceId { get; set; }
        [ForeignKey("ServiceType")]
        public Guid serviceTypeId { get; set; }
        public string serviceName { get; set; }
        public string serviceImage {  get; set; }  
        public string serviceDescription { get; set; }
        public DateTime createAt { get; set; }
        public DateTime updateAt { get; set; }
        public bool isDeleted { get; set; }

        public ServiceType ServiceType { get; set; }

    }
}
