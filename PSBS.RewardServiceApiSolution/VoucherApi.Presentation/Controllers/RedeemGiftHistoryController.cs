using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
using VoucherApi.Application.DTOs.Conversions;
using VoucherApi.Application.Interfaces;
using VoucherApi.Domain.Entities;

namespace VoucherApi.Presentation.Controllers
{
    public class RedeemGiftHistoryController( IRedeemGiftHistory _redeemGiftHistory) : Controller
    {
        [HttpPost("redeemhistory")]
        public async Task<IActionResult> CreateRedeemHistory([FromBody] RedeemGiftHistory redeemGiftHistory)
        {
            if (redeemGiftHistory == null)
            {
                return BadRequest(new Response(false, "Invalid redeem history data"));
            }

            await _redeemGiftHistory.AddRedeemGiftHistory(redeemGiftHistory);
            return Ok(new Response(true, "Gift redemption completed successfully"));
        }

        [HttpGet("redeemhistory/{accountId}")]
        public async Task<IActionResult> GetCustomerRedeemHistory(Guid accountId)
        {
            var history = await _redeemGiftHistory.GetCustomerRedeemHistory(accountId);

            if (history == null || !history.Any())
            {
                return NotFound(new Response(false, "No redeem history found for this account"));
            }

            return Ok(new Response
            {
                Flag = true,
                Message = "Redeem history retrieved successfully",
                Data = history
            });
        }

        [HttpGet("redeemhistory/All")]
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
        public async Task<IActionResult> UpdateRedeemStatus(Guid redeemId, Guid statusId)
        {
            var response = await _redeemGiftHistory.UpdateRedeemStatus(redeemId, statusId);
          

            return Ok(response);
        }

        [HttpGet("redeemhistory/statuses")]
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
