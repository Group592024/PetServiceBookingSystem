using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Domain.Entities
{
    public class ServiceType
    {
        [Key]
        public Guid serviceTypeId { get; set; }
        public string typeName { get; set; }
        public string description { get; set; }
        public DateTime createAt { get; set; }
        public DateTime updateAt { get; set; }
        public bool isDeleted { get; set; }

    }
}
