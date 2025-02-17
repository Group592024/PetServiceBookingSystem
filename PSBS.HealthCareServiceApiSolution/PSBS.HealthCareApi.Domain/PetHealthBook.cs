using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Domain
{
    [Table("PetHealthBook")]
    public class PetHealthBook
    {
        [Key, Column("healthBook_Id")]
        public Guid healthBookId { get; set; }

        [Column("booking_Id")]
        public Guid bookingId { get; set; }

        [Column("medicine_Ids")]
        public List<Guid> medicineIds { get; set; } = new List<Guid>();

        [Column("visit_Date")]
        public DateTime visitDate { get; set; }

        [Column("nextvisit_Date")]
        public DateTime? nextVisitDate { get; set; }

        [Column("perform_By")]
        public string performBy { get; set; }

        [Column("created_at")]
        public DateTime createdAt { get; set; }

        [Column("updated_at")]
        public DateTime? updatedAt { get; set; }

        [Column("isDeleted")]
        public bool isDeleted { get; set; }
        public virtual ICollection<Medicine> Medicines { get; set; }
    }


}
