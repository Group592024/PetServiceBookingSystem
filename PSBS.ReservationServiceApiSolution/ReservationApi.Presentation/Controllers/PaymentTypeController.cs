using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.Intefaces;
using PSPS.SharedLibrary.Responses;

namespace ReservationApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentTypeController(IPaymentType paymentTypeInterface) : ControllerBase
    {
        // GET: api/<paymentTypeController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentTypeDTO>>> GetpaymentTypes()
        {
            // get all paymentTypes from repo
            var paymentType = await paymentTypeInterface.GetAllAsync();
            if (!paymentType.Any())
                return NotFound(new Response(false, "No Payment Type detected"));
            // convert data from entity to DTO and return
            var (_, list) = PaymentTypeConversion.FromEntity(null!, paymentType);
            return list!.Any() ? Ok(new Response(true, "Payment Type retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Payment Type detected"));

        }

        // GET api/<paymentTypeController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentTypeDTO>> GetpaymentTypeById(Guid id)
        {
            // get single paymentType from the repo
            var paymentType = await paymentTypeInterface.GetByIdAsync(id);
            if (paymentType is null)
            {
                return NotFound(new Response(false, "paymentType requested not found"));
            }
            // convert from entity to DTO and return
            var (_paymentType, _) = PaymentTypeConversion.FromEntity(paymentType, null!);
            return _paymentType is not null ? Ok(new Response(true, "The Payment Type retrieved successfully") { Data = _paymentType })
                : NotFound(new Response(false, "Payment Type requested not found"));
        }

        // POST api/<paymentTypeController>
        [HttpPost]
        public async Task<ActionResult<Response>> CreatepaymentType([FromBody] PaymentTypeDTO paymentType)
        {
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT
            var getEntity = PaymentTypeConversion.ToEntity(paymentType);
            var response = await paymentTypeInterface.CreateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }

        // PUT api/<paymentTypeController>/5
        [HttpPut]
        public async Task<ActionResult<Response>> UpdatepaymentType( [FromBody] PaymentTypeDTO paymentType)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT         
            var getEntity = PaymentTypeConversion.ToEntity(paymentType);
            var response = await paymentTypeInterface.UpdateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
        // DELETE api/<paymentTypeController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeletepaymentType(Guid id)
        {
            // convert to entity to DT
            var getEntity = await paymentTypeInterface.GetByIdAsync(id);
            var response = await paymentTypeInterface.DeleteAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
    }
}