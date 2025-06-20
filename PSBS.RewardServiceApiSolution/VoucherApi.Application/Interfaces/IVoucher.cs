﻿using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.Interfaces
{
    public interface IVoucher : IGenericInterface<Voucher>
    {
        Task<IEnumerable<Voucher>> GetAllForCustomer();
        Task<Response> MinusVoucherQuanitty(Guid id);
        Task<IEnumerable<Voucher>> GetValidVoucherForCustomer();
        Task<Voucher> GetVoucherByVoucherCode(string voucherCode);
        Task<Response> RefundVoucherQuantity(Guid id);
    }
}
