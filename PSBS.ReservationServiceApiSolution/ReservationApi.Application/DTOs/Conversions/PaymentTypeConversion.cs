

using ReservationApi.Domain.Entities;

namespace ReservationApi.Application.DTOs.Conversions
{
    public class PaymentTypeConversion
    {
        public static PaymentType ToEntity(PaymentTypeDTO PaymentTypeDTO) => new()
        {
            PaymentTypeId = PaymentTypeDTO.PaymentTypeId,
            PaymentTypeName = PaymentTypeDTO.PaymentTypeName,
            isDeleted = false

        };

        public static (PaymentTypeDTO?, IEnumerable<PaymentTypeDTO>?) FromEntity(PaymentType paymentType, IEnumerable<PaymentType> paymentTypes)
        {
            if (paymentType is not null || paymentTypes is null)
            {
                var singlePaymentType = new PaymentTypeDTO(
                    paymentType!.PaymentTypeId,
                    paymentType.PaymentTypeName,
                    paymentType.isDeleted
                    );
                return (singlePaymentType, null);
            }
            if (paymentType is null || paymentTypes is not null)
            {
                var list = paymentTypes!.Select(p => new PaymentTypeDTO(
                    p.PaymentTypeId,
                    p.PaymentTypeName,
                    p.isDeleted
                    )).ToList();
                return (null, list);
            }
            return (null, null);
        }
    }
}
