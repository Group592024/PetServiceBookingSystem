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
            return list!.Any() ? Ok(new Response(true, "Vouchers retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Voucher detected"));


        }

        // GET: api/<VoucherController>
        [HttpGet("customer")]
        public async Task<ActionResult<IEnumerable<VoucherDTO>>> GetVouchersForCustomer()
        {
            // get all vouchers from repo
            var vouchers = await voucherInteface.GetAllForCustomer();
            if (!vouchers.Any())
                return NotFound("No vouchers detected in the database");
            // convert data from entity to DTO and return
            var (_, list) = VoucherConversion.FromEntity(null!, vouchers);
            return list!.Any() ? Ok(new Response(true, "Vouchers retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Voucher detected"));


        }

        // GET: api/<VoucherController>
        [HttpGet("valid-voucher")]
        public async Task<ActionResult<IEnumerable<VoucherDTO>>> GetValidVouchersForCustomer()
        {
            // get all vouchers from repo
            var vouchers = await voucherInteface.GetValidVoucherForCustomer();
            if (!vouchers.Any())
                return NotFound("No vouchers detected in the database");
            // convert data from entity to DTO and return
            var (_, list) = VoucherConversion.FromEntity(null!, vouchers);
            return list!.Any() ? Ok(new Response(true, "Vouchers retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Voucher detected"));


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
            return _voucher is not null ? Ok(new Response(true, "The Voucher retrieved successfully") { Data = _voucher })
            : NotFound(new Response(false, "Voucher requested not found"));
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
        [HttpPut]
        public async Task<ActionResult<Response>> UpdateVoucher( [FromBody] UpdateVoucherDTO voucher)
        {
        
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT         
            var getEntity = VoucherConversion.UpdateToEntity(voucher);
            var response = await voucherInteface.UpdateAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }

        // PUT api/<VoucherController>/5
        [HttpPut("update-quantity/{id}")]
        public async Task<ActionResult<Response>> UpdateVoucherQuantity(Guid id)
        {
            var response = await voucherInteface.MinusVoucherQuanitty(id);
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
