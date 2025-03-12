using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Application.DTOs.Conversions;
using VoucherApi.Application.Interfaces;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Presentation.Controllers
{
    [Authorize]
    public class RedeemGiftHistoryController( IRedeemGiftHistory _redeemGiftHistory) : Controller
    {
        [HttpPost("redeemhistory")]
         [AllowAnonymous]
        public async Task<IActionResult> CreateRedeemHistory([FromBody] RedeemGiftHistory redeemGiftHistory)
        {
            if (redeemGiftHistory == null)
            {
                return BadRequest(new Response(false, "Invalid redeem history data"));
            }
            

          var res =  await _redeemGiftHistory.AddRedeemGiftHistory(redeemGiftHistory);
            return Ok(res);
        }

        [HttpGet("redeemhistory/{accountId}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<IActionResult> GetCustomerRedeemHistory(Guid accountId)
        {
            var history = await _redeemGiftHistory.GetCustomerRedeemHistory(accountId);

            if (history == null || !history.Any())
            {
                return Ok(new Response(false, "No redeem history found for this account"));
            }

            var (_, list) = RedeemGiftHistoryConversion.FromEntity(null!, history);
            return list!.Any() ? Ok(new Response(true, "Redeem retrieved successfully!")
            {
                Data = list
            }) : Ok(new Response(false, "No Redeem detected"));
        }
        [HttpGet("redeemhistory/app/{accountId}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<IActionResult> GetCustomerRedeemList(Guid accountId)
        {
            var history = await _redeemGiftHistory.GetCustomerRedeemHistory(accountId);

            if (history == null || !history.Any())
            {
                return Ok(new Response(false, "No redeem history found for this account"));
            }

            var (_, list) = RedeemGiftHistoryConversion.FromEntityToRedeemDetailDTO(null!, history);
            return list!.Any() ? Ok(new Response(true, "Redeem retrieved successfully!")
            {
                Data = list
            }) : Ok(new Response(false, "No Redeem detected"));
        }
        [HttpGet("redeemhistory/All")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<IActionResult> GetAllRedeemHistories()
        {
            var history = await _redeemGiftHistory.GetAllRedeemHistories();

            if (history == null || !history.Any())
            {
                return NotFound(new Response(false, "No redeem histories available"));
            }
  

            var (_, list) = RedeemGiftHistoryConversion.FromEntity(null!, history);
            return list!.Any() ? Ok(new Response(true, "Redeem retrieved successfully!")
            {
                Data = list
            }) : NotFound(new Response(false, "No Redeem detected"));
        }

        [HttpPut("redeemhistory/{redeemId}/status/{statusId}")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<IActionResult> UpdateRedeemStatus(Guid redeemId, Guid statusId)
        {
            var response = await _redeemGiftHistory.UpdateRedeemStatus(redeemId, statusId);
          

            return Ok(response);
        }

        [HttpPut("redeemhistory/customer/cancel/{redeemId}")]
        [AllowAnonymous]
        public async Task<IActionResult> CustomerCancel(Guid redeemId)
        {
            var response = await _redeemGiftHistory.CustomerCancelRedeem(redeemId);


            if (response.Flag)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [HttpGet("redeemhistory/statuses")]
        [Authorize(Policy = "AdminOrStaffOrUser")]
        public async Task<IActionResult> GetAllStatuses()
        {
            var history = await _redeemGiftHistory.GetRedeemStatuses();

            if (history == null || !history.Any())
            {
                return NotFound(new Response(false, "No redeem status available"));
            }

            return Ok(new Response
            {
                Flag = true,
                Message = "Redeem status retrieved successfully",
                Data = history
            });
        }

    }
}
