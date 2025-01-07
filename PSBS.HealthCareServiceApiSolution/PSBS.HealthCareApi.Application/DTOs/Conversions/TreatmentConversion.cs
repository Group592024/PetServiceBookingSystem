using PSBS.HealthCareApi.Domain;


namespace PSBS.HealthCareApi.Application.DTOs.Conversions
{

    namespace PSBS.HealthCareApi.Application.DTOs.Conversions
    {
        public static class TreatmentConversion
        {
            public static Treatment ToEntity(TreatmentDTO treatment)
            {
                return new Treatment()
                {
                    treatmentId = treatment.treatmentId,
                    treatmentName = treatment.treatmentName,
                    isDeleted = treatment.isDeleted ?? false
                };
            }

            public static (TreatmentDTO?, IEnumerable<TreatmentDTO>?) FromEntity(Treatment? treatment, IEnumerable<Treatment>? treatments)
            {
                if (treatment is not null && treatments is null)
                {
                    var singleTreatment = new TreatmentDTO
                    {
                        treatmentId = treatment.treatmentId,
                        treatmentName = treatment.treatmentName,
                        isDeleted = treatment.isDeleted
                    };
                    return (singleTreatment, null);
                }

                if (treatments is not null && treatment is null)
                {
                    var _treatments = treatments.Select(t => new TreatmentDTO
                    {
                        treatmentId = t.treatmentId,
                        treatmentName = t.treatmentName,
                        isDeleted = t.isDeleted
                    }).ToList();

                    return (null, _treatments);
                }

                return (null, null);
            }
        }
    }

}
