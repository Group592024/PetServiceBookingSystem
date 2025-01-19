using PSPS.SharedLibrary.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VoucherApi.Application.DTOs.GiftDTOs;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Application.Interfaces
{
    public interface IGift : IGenericInterface<Gift>
    {
        Task<IEnumerable<Gift>> GetGiftListForCustomerAsync();
        Task<Gift> GetGiftDetailForCustomerAsync(Guid id);
    }
}
