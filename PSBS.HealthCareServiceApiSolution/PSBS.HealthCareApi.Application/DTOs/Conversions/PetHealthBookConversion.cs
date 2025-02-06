using PSBS.HealthCareApi.Application.DTOs.MedicinesDTOs;
using PSBS.HealthCareApi.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSBS.HealthCareApi.Application.DTOs.Conversions
{
    public static class PetHealthBookConversion
    {

        public static PetHealthBook ToEntity(PetHealthBookDTO petHealthBookDTO)
        {
            return new PetHealthBook()
            {
                healthBookId = petHealthBookDTO.healthBookId,
                bookingId = petHealthBookDTO.bookingId,
                medicineId = petHealthBookDTO.medicineId,
                visitDate = petHealthBookDTO.visitDate,
                nextVisitDate = petHealthBookDTO.nextVisitDate,
                performBy = petHealthBookDTO.performBy,
                createdAt = petHealthBookDTO.createdAt,
                updatedAt = petHealthBookDTO.updatedAt,
                isDeleted = petHealthBookDTO.isDeleted
            };
        }

        public static (PetHealthBookDTO?, IEnumerable<PetHealthBookDTO>?) FromEntity(PetHealthBook? petHealthBook, IEnumerable<PetHealthBook>? petHealthBooks)
        {
            if (petHealthBook is not null && petHealthBooks is null)
            {
                var singlePetHealthBook = new PetHealthBookDTO
                (
                    petHealthBook.healthBookId,
                    petHealthBook.bookingId,
                    petHealthBook.medicineId,
                    petHealthBook.visitDate,
                    petHealthBook.nextVisitDate,
                    petHealthBook.performBy,
                    petHealthBook.createdAt,
                    petHealthBook.updatedAt,
                    petHealthBook.isDeleted
                );
                return (singlePetHealthBook, null);
            }

            if (petHealthBooks is not null && petHealthBook is null)
            {
                var list = petHealthBooks!.Select(t => new PetHealthBookDTO
                    (
                        t.healthBookId,
                        t.bookingId,
                        t.medicineId,
                        t.visitDate,
                        t.nextVisitDate,
                        t.performBy,
                        t.createdAt,
                        t.updatedAt,
                        t.isDeleted
                    )).ToList();

                return (null, list);
            }

            return (null, null);
        }

    }

}