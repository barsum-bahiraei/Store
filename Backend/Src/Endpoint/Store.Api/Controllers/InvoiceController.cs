using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Invoices.Models.Input;
using Store.Service.EntityService;

namespace Store.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController(InvoiceService invoiceService) : ControllerBase
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
    [HttpPost("Checkout")]
    public async Task<IActionResult> Checkout(CheckoutInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.CheckoutAsync(userId, input, cancellation);
        return Ok(result);
    }
}
