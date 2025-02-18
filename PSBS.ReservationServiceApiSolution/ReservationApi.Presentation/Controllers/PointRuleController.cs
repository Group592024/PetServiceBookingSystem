using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReservationApi.Application.DTOs.Conversions;
using ReservationApi.Application.DTOs;
using ReservationApi.Application.Intefaces;
using PSPS.SharedLibrary.Responses;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ReservationApi.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PointRuleController(IPointRule pointRuleInterface) : ControllerBase
    {
        // GET: api/<PointRuleController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PointRuleDTO>>> GetPointRules()
        {
            // get all pointRules from repo
            var pointRules = await pointRuleInterface.GetAllAsync();
            if (!pointRules.Any())
                return NotFound(new Response(false, "No Point Rule detected"));
            // convert data from entity to DTO and return
            var (_, list) = PointRuleConversion.FromEntity(null!, pointRules);
            return list!.Any() ? Ok(new Response(true, "Point Rule retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Point Rule detected"));

        }

        // GET api/<PointRuleController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PointRuleDTO>> GetPointRuleById(Guid id)
        {
            // get single pointRule from the repo
            var pointRule = await pointRuleInterface.GetByIdAsync(id);
            if (pointRule is null)
            {
                return NotFound(new Response(false, "pointRule requested not found"));
            }
            // convert from entity to DTO and return
            var (_pointRule, _) = PointRuleConversion.FromEntity(pointRule, null!);
            return _pointRule is not null ? Ok(new Response(true, "The point Rule retrieved successfully") { Data = _pointRule })
                : NotFound(new Response(false, "pointRule requested not found"));
        }

        // POST api/<PointRuleController>
        [HttpPost]
        public async Task<ActionResult<Response>> CreatePointRule([FromBody] PointRuleDTO pointRule)
        {
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT
            var getEntity = PointRuleConversion.ToEntity(pointRule);
            var response = await pointRuleInterface.CreateAsync(getEntity);
            return response.Flag is true ? Ok(response) : Ok(response);
        }

        // PUT api/<PointRuleController>/5
        [HttpPut]
        public async Task<ActionResult<Response>> UpdatePointRule( [FromBody] PointRuleDTO pointRule)
        {
            ModelState.Remove("pointRulestartDate");
            // CHECK model state is all data annotations are passed
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // convert to entity to DT         
            var getEntity = PointRuleConversion.ToEntity(pointRule);
            var response = await pointRuleInterface.UpdateAsync(getEntity);
            return response.Flag is true ? Ok(response) : Ok(response);
        }
        // DELETE api/<PointRuleController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response>> DeletePointRule(Guid id)
        {
            // convert to entity to DT
            var getEntity = await pointRuleInterface.GetByIdAsync(id);
            var response = await pointRuleInterface.DeleteAsync(getEntity);
            return response.Flag is true ? Ok(response) : BadRequest(response);
        }

        [HttpGet("/active")]
        public async Task<ActionResult<PointRuleDTO>> GetPointRuleActive()
        {
            // get all pointRules from repo
            var pointRule = await pointRuleInterface.GetPointRuleActiveAsync();
            if (pointRule == null)
                return NotFound(new Response(false, "No Point Rule detected"));
            // convert data from entity to DTO and return
            var (_pointRule, _) = PointRuleConversion.FromEntity(pointRule, null!);
            return pointRule is not null ? Ok(new Response(true, "Point Rule retrieved successfully!")
            {
                Data = _pointRule
            }) : NotFound(new Response(false, "No Point Rule detected"));

        }
    }
}