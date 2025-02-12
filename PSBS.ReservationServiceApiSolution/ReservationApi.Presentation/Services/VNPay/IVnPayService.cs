using ReservationApi.Application.DTOs;

namespace ReservationApi.Presentation.Services.VNPay
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(VNPayRequestDTO model, HttpContext context);
        VNPayResponseDTO PaymentExecute(IQueryCollection collections);

    }
}
