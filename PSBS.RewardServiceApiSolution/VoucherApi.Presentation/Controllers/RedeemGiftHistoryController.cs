using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;
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

            return Ok(new Response
            {
                Flag = true,
                Message = "Redeem history retrieved successfully",
                Data = history
            });
        }

    }
}
