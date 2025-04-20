using FacilityServiceApi.Application.DTOs;
using System.Net.Http.Json;
namespace FacilityServiceApi.Infrastructure.Services
{
    public class ReservationApiClient
    {
        private readonly HttpClient _httpClient;

        public ReservationApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<Guid>> GetPaidBookingIds(string token, int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            _httpClient.DefaultRequestHeaders.Authorization
                = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            var queryParams = new List<string>();

            if (startDate.HasValue)
                queryParams.Add($"startDate={startDate.Value:yyyy-MM-dd}");
            if (endDate.HasValue)
                queryParams.Add($"endDate={endDate.Value:yyyy-MM-dd}");
            if (month.HasValue)
                queryParams.Add($"month={month}");
            if (year.HasValue)
                queryParams.Add($"year={year}");

            var queryString = string.Join("&", queryParams);
            var response = await _httpClient.GetAsync($"/api/ReportBooking/paid?{queryString}");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Error Content: {errorContent}");
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<PaidBookingIdsDTO>();
            return result?.BookingIds ?? new List<Guid>();
        }
    }
}
