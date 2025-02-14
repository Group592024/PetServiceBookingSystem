using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSBS.HealthCareApi.Application.DTOs;
using PSBS.HealthCareApi.Application.DTOs.Conversions;
using PSBS.HealthCareApi.Application.Interfaces;
using PSBS.HealthCareApi.Domain;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;

namespace PSBS.HealthCareApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetHealthBookController(IPetHealthBook petHealthBookInterface) : ControllerBase

    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PetHealthBookDTO>>> GetPetHealthBooks()
        {
            // get all BookingStatuss from repo
            var petHealthBook = await petHealthBookInterface.GetAllAsync();
            if (!petHealthBook.Any())
                return NotFound(new Response(false, "No Booking  detected"));
            // convert data from entity to DTO and return
            var (_, list) = PetHealthBookConversion.FromEntity(null!, petHealthBook);
            return list!.Any() ? Ok(new Response(true, "PetHealthBooks  retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No PetHealthBooks  detected"));

        }

        // GET api/<BookingStatusController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PetHealthBookDTO>> GetPetHealthBooksById(Guid id)
        {
            // get single BookingStatus from the repo
            var petHealthBook = await petHealthBookInterface.GetByIdAsync(id);
            if (petHealthBook is null)
            {
                return NotFound(new Response(false, "PetHealthBooks requested not found ne"));
            }
            // convert from entity to DTO and return
            var (_petHealthBook, _) = PetHealthBookConversion.FromEntity(petHealthBook, null!);
            LogExceptions.LogToConsole(_petHealthBook.performBy);
            return _petHealthBook is not null ? Ok(new Response(true, "The PetHealthBooks  retrieved successfully") { Data = _petHealthBook })
                : NotFound(new Response(false, "PetHealthBooks requested not found"));
        }

        [HttpPost]
        public async Task<ActionResult<Response>> CreatePetHealthBooks([FromBody] PetHealthBookConvertDTO petHealthBook)
        {
            // Kiểm tra tính hợp lệ của ModelState
            if (!ModelState.IsValid)
            {
                return BadRequest(new Response(false, "Invalid input") { Data = ModelState });
            }

            try
            {
                // Gọi phương thức tạo mới PetHealthBook từ interface
                var response = await petHealthBookInterface.CreatePetHealthBookAsync(petHealthBook);

                // Trả về kết quả nếu flag của response là true, ngược lại trả về lỗi
                return response.Flag ? Ok(response) : BadRequest(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred: " + ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("Inner Exception: " + ex.InnerException.Message);
                    Console.WriteLine("Inner Exception Stack Trace: " + ex.InnerException.StackTrace);
                }

                return new Response(false, $"An error occurred: {ex.Message}");
            }

        }



        // PUT api/<BookingStatusController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Response>> UpdatePetHealthBooks([FromBody] PetHealthBookDTO petHealthBook)
        {


          //  if (!ModelState.IsValid)
          //      return BadRequest(ModelState);
            // convert to entity to DT         
            var getEntity = PetHealthBookConversion.ToEntity(petHealthBook);
            var response = await petHealthBookInterface.UpdateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
        // DELETE api/<BookingStatusController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeletePetHealthBooks(Guid id)
        {
            // convert to entity to DT
            var getEntity = await petHealthBookInterface.GetByIdAsync(id);
            var response = await petHealthBookInterface.DeleteAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
    }
}