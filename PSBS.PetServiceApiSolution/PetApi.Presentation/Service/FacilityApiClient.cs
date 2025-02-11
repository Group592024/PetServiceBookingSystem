using PetApi.Application.DTOs;
using System.Text.Json;

namespace PetApi.Presentation.Service
{
    public class FacilityApiClient
    {
        private readonly HttpClient _httpClient;

        public FacilityApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<PetCountDTO>> GetPetCount(Guid id)
        {
            var url = $"petCount/{id}";
            Console.WriteLine($"Calling FacilityService: {url}");

            var response = await _httpClient.GetAsync(url);

            Console.WriteLine($"Response Status Code: {response.StatusCode}");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Error Content: {errorContent}");
                throw new Exception($"Error when getting pet count from Facility Service: {response.StatusCode}");
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
