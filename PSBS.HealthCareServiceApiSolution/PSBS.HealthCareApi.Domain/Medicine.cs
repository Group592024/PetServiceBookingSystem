using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Domain
{
    [Table("Medicine")]
    public class Medicine
    {
        [Key,Column("medicine_id")]
        public Guid medicineId { get; set; }
        [ForeignKey("Treatment")]
        [Column("treatment_id")]
        public Guid treatmentId { get; set; }
        public virtual Treatment? Treatment { get; set; }
        public virtual PetHealthBook? PetHealthBook { get; set; }

        [Column("medicine_name")]
        public string medicineName { get; set; }
        [Column("medicine_image")]
        public string medicineImage { get; set; }
        [Column("isDeleted")]
        public bool isDeleted { get; set; }
    }
}
