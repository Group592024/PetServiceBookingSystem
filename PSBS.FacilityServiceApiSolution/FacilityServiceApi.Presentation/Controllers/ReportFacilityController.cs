//using FacilityServiceApi.Application.DTOs;
//using FacilityServiceApi.Application.DTOs.Conversions;
//using FacilityServiceApi.Application.Interfaces;
//using Microsoft.AspNetCore.Mvc;

//namespace FacilityServiceApi.Presentation.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class ReportFacilityController : ControllerBase
//    {
//        private readonly IService _service;

//        public ReportFacilityController(IService service)
//        {
//            _service = service;
//        }

//        [HttpGet("{id}")]
//        public async Task<ActionResult<IEnumerable<ServiceDTO>>> GetServiceVariantListById(Guid id, [FromQuery] bool showAll)
//        {
//            if (showAll)
//            {
//                var service = await _service.GetByIdAsync(id);
//                if (service == null)
//                {
//                    return NotFound(new Response(false, $"Service with GUID {id} not found or is deleted"));
//                }

//                var serviceVariants = (await _serviceVariant.GetAllVariantsAsync(id))

//                            .ToList();
//                if (!serviceVariants.Any())
//                {
//                    return NotFound(new Response(false, "No service variants found in the database"));
//                }

//                var (_, serviceVariantDtos) = ServiceVariantConversion.FromEntity(null!, serviceVariants);
//                return Ok(new Response(true, "Service variants retrieved successfully")
//                {
//                    Data = serviceVariantDtos
//                });
//            }
//            else
//            {
//                var service = await _service.GetByIdAsync(id);
//                if (service == null)
//                {
//                    return NotFound(new Response(false, $"Service with GUID {id} not found or is deleted"));
//                }

//                var serviceVariants = (await _serviceVariant.GetAllVariantsAsync(id))
//                            .ToList();
//                if (!serviceVariants.Any())
//                {
//                    return NotFound(new Response(false, "No service variants found in the database"));
//                }

//                var (_, serviceVariantDtos) = ServiceVariantConversion.FromEntity(null!, serviceVariants);
//                return Ok(new Response(true, "Service variants retrieved successfully")
//                {
//                    Data = serviceVariantDtos
//                });
//            }
//        }
//    }
//}
