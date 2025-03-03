using PSBS.HealthCareApi.Domain;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PSBS.HealthCareApi.Application.DTOs.Conversions
{
    public static class PetHealthBookConversion
    {
        public static PetHealthBook ToEntity(PetHealthBookDTO petHealthBookDTO)
        {
            return new PetHealthBook()
            {
                healthBookId = petHealthBookDTO.healthBookId ?? Guid.NewGuid(),
                BookingServiceItemId = petHealthBookDTO.BookingServiceItemId,
                visitDate = petHealthBookDTO.visitDate,
                nextVisitDate = petHealthBookDTO.nextVisitDate,
                performBy = petHealthBookDTO.performBy,
                createdAt = petHealthBookDTO.createdAt,
                updatedAt = petHealthBookDTO.updatedAt,
                isDeleted = petHealthBookDTO.isDeleted,
                medicineIds = petHealthBookDTO.medicineIds
            };
        }

        public static (PetHealthBookDTO?, IEnumerable<PetHealthBookDTO>?) FromEntity(PetHealthBook? petHealthBook, IEnumerable<PetHealthBook>? petHealthBooks)
        {
            if (petHealthBook != null && petHealthBooks == null)
            {
                var singlePetHealthBook = new PetHealthBookDTO
                (
                    petHealthBook.healthBookId,
                    petHealthBook.BookingServiceItemId,
                    petHealthBook.visitDate,
                    petHealthBook.nextVisitDate,
                    petHealthBook.performBy,
                    petHealthBook.createdAt,
                    petHealthBook.updatedAt,
                    petHealthBook.isDeleted,
                    petHealthBook.medicineIds
                );
                return (singlePetHealthBook, null);
            }

            if (petHealthBooks != null && petHealthBook == null)
            {
                var list = petHealthBooks.Select(t => new PetHealthBookDTO
                (
                    t.healthBookId,
                    t.BookingServiceItemId,
                    t.visitDate,
                    t.nextVisitDate,
                    t.performBy,
                    t.createdAt,
                    t.updatedAt,
                    t.isDeleted,
                    t.medicineIds
                )).ToList();

                return (null, list);
            }

            return (null, null);
        }
    }
}


