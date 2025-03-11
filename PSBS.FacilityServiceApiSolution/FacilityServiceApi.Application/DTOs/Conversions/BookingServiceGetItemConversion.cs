using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public static class BookingServiceGetItemConversion
    {
        public static BookingServiceItem ToEntity(BookingServiceItemDTO bookingServiceItem)
        {
            return new BookingServiceItem()
            {
                BookingServiceItemId = bookingServiceItem.BookingServiceItemId,
                BookingId = bookingServiceItem.BookingId,
                ServiceVariantId = bookingServiceItem.ServiceVariantId,
                PetId = bookingServiceItem.PetId,
                Price = bookingServiceItem.Price,
                CreateAt = bookingServiceItem.CreateAt,
                UpdateAt = bookingServiceItem.UpdateAt
            };
        }
        public static BookingServiceItem ToEntityForCreate(CreateBookingServiceItemDTO createServiceItemDTO)
        {
            return new BookingServiceItem()
            {
                BookingServiceItemId = Guid.Empty,
                BookingId = createServiceItemDTO.BookingId,
                ServiceVariantId = createServiceItemDTO.ServiceVariantId,
                PetId = createServiceItemDTO.PetId,
                Price = createServiceItemDTO.Price,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now
            };
        }
        public static (BookingServiceItemDTO?, IEnumerable<BookingServiceItemDTO>?) FromEntity(
    BookingServiceItem? serviceItem, IEnumerable<BookingServiceItem>? serviceItems)
        {
            if (serviceItem is not null && serviceItems is null)
            {
                var singleServiceItem = new BookingServiceItemDTO
                (
                    serviceItem.BookingServiceItemId,
                    serviceItem.BookingId,
                    serviceItem.ServiceVariantId,
                    serviceItem.PetId,
                    serviceItem.Price,
                    serviceItem.CreateAt,
                    serviceItem.UpdateAt
                );
                return (singleServiceItem, null);
            }

            if (serviceItem is null && serviceItems is not null)
            {
                var _serviceItems = serviceItems.Select(rt => new BookingServiceItemDTO
                (
                    rt.BookingServiceItemId,
                    rt.BookingId,
                    rt.ServiceVariantId,
                    rt.PetId,
                    rt.Price,
                    rt.CreateAt,
                    rt.UpdateAt
                )).ToList();

                return (null, _serviceItems);
            }

            return (null, null);
        }

    }
}
