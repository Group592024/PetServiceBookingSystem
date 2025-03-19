using PetApi.Application.DTOs;
using System.Text.Json;

namespace PetApi.Infrastructure.Service
{
    public class FacilityApiClient
    {
        private readonly HttpClient _httpClient;

        public FacilityApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<PetCountDTO>> GetPetCount(Guid id, string token,
            int? year, int? month, DateTime? startDate, DateTime? endDate)
        {
            _httpClient.DefaultRequestHeaders.Authorization
                = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var queryParams = new List<string>();
            if (year.HasValue)
                queryParams.Add($"year={year.Value}");
            if (month.HasValue)
                queryParams.Add($"month={month.Value}");
            if (startDate.HasValue)
                queryParams.Add($"startDate={startDate.Value:yyyy-MM-dd}");
            if (endDate.HasValue)
                queryParams.Add($"endDate={endDate.Value:yyyy-MM-dd}");

            var queryString = queryParams.Any() ? "?" + string.Join("&", queryParams) : "";

            var url = $"petCount/{id}{queryString}";
            Console.WriteLine($"Calling FacilityService: {url}");

            var fullUrl = $"{_httpClient.BaseAddress}petCount/{id}";
            Console.WriteLine($"Calling URL: {fullUrl}");


            var response = await _httpClient.GetAsync(url);

            Console.WriteLine($"Response Status Code: {response.StatusCode}");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Error Content: {errorContent}");
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();

            Console.WriteLine("content day nay" + content);


            var result = JsonSerializer.Deserialize<List<PetCountDTO>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Console.WriteLine("result  day nay" + result.Count());


            return result ?? new List<PetCountDTO>();
        }

    }
}
