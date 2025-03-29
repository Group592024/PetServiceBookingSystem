using Azure;
using Polly.Registry;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.PSBSLogs;
using System.Net.Http.Json;

namespace PSBS.HealthCareApi.Infrastructure.Services
{
    public class FetchHealthBookDetailService(IHttpClientFactory httpClientFactory,
         ResiliencePipelineProvider<string> resiliencePipeline) : IFetchHealthBookDetail
    {
        public async Task<IEnumerable<HealthBookMessageDTO>> FetchHealthBookDetailList(IEnumerable<PetHealthBook> healthBooks)
        {
            var healthBookMessageDTOs = new List<HealthBookMessageDTO>();
            var retryPipeline = resiliencePipeline.GetPipeline("my-retry-pipeline");

            foreach (var healthBook in healthBooks)
            {
                try
                {
                    // Get booking item with retry
                    var bookingItem = await retryPipeline.ExecuteAsync(async token =>
                        await GetBookingItem(healthBook.BookingServiceItemId));

                    if (bookingItem == null)
                    {
                        LogExceptions.LogToConsole($"Booking item not found for health book {healthBook.BookingServiceItemId}");
                        continue;
                    }

                    var pet = await retryPipeline.ExecuteAsync(async token =>
                        await GetPetDetail(bookingItem.PetId));
                    if (pet == null)
                    {
                        LogExceptions.LogToConsole($"Pet not found for booking item {bookingItem.BookingServiceItemId}");
                        continue;
                    }
                    var booking = await retryPipeline.ExecuteAsync(async token =>
                        await GetBooking(bookingItem.BookingId));

                    if (booking == null)
                    {
                        LogExceptions.LogToConsole($"booking not found for booking item {bookingItem.BookingServiceItemId}");
                        continue;
                    }

                    healthBookMessageDTOs.Add(new HealthBookMessageDTO
                    {
                        UserId = pet.accountId,
                        visitDate = healthBook.visitDate,
                        nextVisitDate = healthBook.nextVisitDate.GetValueOrDefault(),
                        bookingCode = booking?.BookingCode ?? "N/A",
                        PetName = pet.petName
                    });
                }
                catch (Exception ex)
                {
                    LogExceptions.LogToConsole($"Error processing health book {healthBook.BookingServiceItemId}: {ex.Message}");
                }
            }

            return healthBookMessageDTOs;
        }

        public async Task<BookingServiceItemDTO?> GetBookingItem(Guid bookingItemId)
        {
            try
            {
                var client = httpClientFactory.CreateClient("ApiGateway");
                var response = await client.GetAsync($"/api/BookingServiceItems/mail/{bookingItemId}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    LogExceptions.LogToConsole($"API Error ({response.StatusCode}): {errorContent}, bookingItemId: {bookingItemId}");
                    return null;
                }

                var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<BookingServiceItemDTO>>();
                return apiResponse?.Data;
            }
            catch (Exception ex)
            {
                LogExceptions.LogToConsole($"Error fetching booking item for bookingItemId: {bookingItemId}, Error: {ex.Message}");
                return null;
            }
        }

        public async Task<BookingDTO?> GetBooking(Guid bookingId)
        {
            try
            {
                var client = httpClientFactory.CreateClient("ApiGateway");
                var response = await client.GetAsync($"/Bookings/{bookingId}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    LogExceptions.LogToConsole($"API Error ({response.StatusCode}): {errorContent}");
                    return null;
                }

                var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<BookingDTO>>();
                return apiResponse?.Data;
            }
            catch (Exception ex)
            {
                LogExceptions.LogToConsole($"Error fetching booking: {ex.Message}");
                return null;
            }
        }

        public async Task<PetDTO?> GetPetDetail(Guid petId)
        {
            try
            {
                var client = httpClientFactory.CreateClient("ApiGateway");
                var response = await client.GetAsync($"/api/pet/{petId}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    LogExceptions.LogToConsole($"API Error ({response.StatusCode}): {errorContent}");
                    return null;
                }

                var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<PetDTO>>();
                return apiResponse?.Data;
            }
            catch (Exception ex)
            {
                LogExceptions.LogToConsole($"Error fetching pet: {ex.Message}");
                return null;
            }
        }
    }
}