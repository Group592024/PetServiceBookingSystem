using Microsoft.AspNetCore.Mvc;
using PetApi.Application.Interfaces;
using PetApi.Presentation.Service;
using PSPS.SharedLibrary.Responses;


namespace PetApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportPetController : ControllerBase
    {

        private readonly IReport _report;
        private readonly FacilityApiClient _facilityApiClient;

        public ReportPetController(IReport report, FacilityApiClient facilityApiClient)
        {
            _report = report;
            _facilityApiClient = facilityApiClient;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Dictionary<string, int>>> getPetCount(Guid id)
        {
            var response = await _facilityApiClient.GetPetCount(id);

            Console.WriteLine("response day nay" + response.Count());


            if (!response.Any())
            {
                return NotFound(new Response(false, "No pet count dto found"));
            }

            var result = await _report.GetPetBreedByPetCoutDTO(response);

            Console.WriteLine("sau khi goi petbreed: " + result);

            if (result is null)
            {
                return NotFound(new Response(false, "No pet breed count found"));
            }

            return Ok(new Response(true, "Pet breed counted successfully")
            {
                Data = result
            });
        }
    }
}
