﻿using PetApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;

namespace PetApi.Application.Interfaces
{
    public interface IPet : IGenericInterface<Pet>
    {
        Task<IEnumerable<Pet>> ListAvailablePetAsync(Guid accountId);


    }
}
