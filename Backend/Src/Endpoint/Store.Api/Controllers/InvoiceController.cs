using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Store.Api.Authorization;
using Store.Domain.Invoices.Models.Input;
using Store.Service.EntityService;
using Store.Service.ProviderService;

namespace Store.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController(InvoiceService invoiceService, IOptions<MellatPaymentOptions> mellatOptions) : ControllerBase
{
    [HasAccess]
    [HttpGet]
    public async Task<IActionResult> InvoiceGet(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.ListAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("Cart")]
    public async Task<IActionResult> CartGet(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.CartListAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Cart")]
    public async Task<IActionResult> CartPost(CartCreateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.CartCreateAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("Cart/{id}")]
    public async Task<IActionResult> CartPut(int id, CartUpdateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.CartUpdateAsync(id, userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Cart/{id}")]
    public async Task<IActionResult> CartDelete(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.CartDeleteAsync(id, userId, cancellation);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("Discount/Validate")]
    public async Task<IActionResult> DiscountCodeValidate(DiscountCodeValidateInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.DiscountCodeValidateAsync(userId, input, cancellation);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("Checkout")]
    public async Task<IActionResult> Checkout(CheckoutInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.CheckoutAsync(userId, input, cancellation);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("{id}/Payment")]
    public async Task<IActionResult> PaymentRetry(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.PaymentRetryAsync(id, userId, cancellation);
        return Ok(result);
    }

    [AllowAnonymous]
    [Consumes("application/x-www-form-urlencoded")]
    [HttpPost("Payment/Mellat/Callback")]
    public async Task<IActionResult> MellatCallback([FromForm] MellatCallbackInput input)
    {
        var result = await invoiceService.MellatCallbackAsync(input, CancellationToken.None);
        var resultUrl = mellatOptions.Value.ResultUrl;
        if (string.IsNullOrWhiteSpace(resultUrl) || !Uri.TryCreate(resultUrl, UriKind.Absolute, out _))
            return Ok(result);

        var status = result.IsSuccessful ? "success" : result.IsPending ? "pending" : "failed";
        var separator = resultUrl.Contains('?') ? '&' : '?';
        var invoice = result.InvoiceId.HasValue ? $"&invoiceId={result.InvoiceId.Value}" : string.Empty;
        return Redirect($"{resultUrl}{separator}status={status}{invoice}");
    }
}
