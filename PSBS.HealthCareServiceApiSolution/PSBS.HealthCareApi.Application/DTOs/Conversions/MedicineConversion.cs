using PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs;
using PSBS.HealthCareApi.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs.Conversions
{
    public static class MedicineConversion
    {
        public static Medicine ToEntity(MedicineDTO medicineDTO, string? imagePath = null) => new()
        {
            medicineId = medicineDTO.medicineId,
            treatmentId = medicineDTO.treatmentId,
            medicineName = medicineDTO.medicineName,
            medicineImage = imagePath ?? medicineDTO.medicineImage,
            isDeleted = medicineDTO.medicineStatus
        };

        public static (MedicineDTO?, IEnumerable<MedicineDTO>?) FromEntity(Medicine medicine, IEnumerable<Medicine>? medicines)
        {
            //return single
            if (medicine != null || medicines == null)
            {
                var singleMedicine = new MedicineDTO
                    (
                        medicine!.medicineId,
                        medicine.treatmentId,
                        medicine.medicineName,
                        medicine.medicineImage,
                        null,
                        medicine.isDeleted
                    );
                return (singleMedicine, null);
            }

            //return list
            if (medicines != null || medicine == null)
            {
                var listMedicines = medicines!.Select(m =>
                    new MedicineDTO(m.medicineId, m.treatmentId, m.medicineName, m.medicineImage, null,m.isDeleted)).ToList();
                return (null, listMedicines);
            }

            return (null, null);
        }

        public static (AdminMedicineListDTO?, IEnumerable<AdminMedicineListDTO>?) FromEntityAdmList(Medicine medicine, IEnumerable<Medicine>? medicines)
        {
            //return single
            if (medicine != null || medicines == null)
            {
                var singleMedicine = new AdminMedicineListDTO
                    (
                        medicine!.medicineId,
                        medicine.treatmentId,
                        medicine.medicineName,
                        medicine.medicineImage,
                        medicine.isDeleted
                    );
                return (singleMedicine, null);
            }

            //return listy

            if (medicines != null || medicine == null)
            {
                var listMedicines = medicines!.Select(m =>
                    new AdminMedicineListDTO(m.medicineId, m.treatmentId, m.medicineName, m.medicineImage,m.isDeleted)).ToList();
                return (null, listMedicines);
            }

            return (null, null);
        }
    }
}
