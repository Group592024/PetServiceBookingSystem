using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Application.DTOs;
using VoucherApi.Application.DTOs.Conversions;
using VoucherApi.Application.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VoucherApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController(IVoucher voucherInteface) : ControllerBase
    {
        // GET: api/<VoucherController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VoucherDTO>>> GetVouchers()
        {
            // get all vouchers from repo
            var vouchers = await voucherInteface.GetAllAsync();
            if (!vouchers.Any())
                return NotFound("No vouchers detected in the database");
            // convert data from entity to DTO and return
            var (_, list) = VoucherConversion.FromEntity(null!, vouchers);
            return list!.Any() ? Ok(list) : NotFound("No voucher found");

        }

        // GET api/<VoucherController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VoucherDTO>> GetVoucherById(Guid id)
        {
            // get single voucher from the repo
            var voucher = await voucherInteface.GetByIdAsync(id);
            if (voucher is null)
            {
                return NotFound("voucher requested not found");
            }
            // convert from entity to DTO and return
            var (_voucher, _) = VoucherConversion.FromEntity(voucher, null);
            return _voucher is not null ? Ok(_voucher) : NotFound("voucher requested not found");
        }

        // POST api/<VoucherController>
        [HttpPost]
        public async Task<ActionResult<Response>> CreateVoucher([FromBody] VoucherDTO voucher)
        {
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT
            var getEntity = VoucherConversion.ToEntity(voucher);
            var response = await voucherInteface.CreateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }

        // PUT api/<VoucherController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Response>> UpdateVoucher(Guid id, [FromBody] VoucherDTO voucher)
        {
            if (!id.Equals(voucher.Id))
            {
                return BadRequest(new Response(false, "The id is not match"));
            }
            ModelState.Remove("VoucherStartDate");
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT         
            var getEntity = VoucherConversion.ToEntity(voucher);
            var response = await voucherInteface.UpdateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
        // DELETE api/<VoucherController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeleteVoucher(Guid id)
        {
            // convert to entity to DT
            var getEntity = await voucherInteface.GetByIdAsync(id);
            var response = await voucherInteface.DeleteAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }
    }
}
