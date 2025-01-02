using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Domain
{
    [Table("Treatment")]
    public class Treatment
    {
        [Key,Column("treatment_Id")]
        public Guid treatmentId { get; set; }
        [Column("treatment_Name")]
        public string treatmentName { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }
        public virtual ICollection<Medicine>? Medicines { get; set; } = new List<Medicine>();
    }
}
