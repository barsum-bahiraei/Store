using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Invoices.Models.Input;
using Store.Service.EntityService;

namespace Store.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class InvoiceController(InvoiceService invoiceService) : ControllerBase
{
    [HasAccess]
    [HttpGet("Pre")]
    public async Task<IActionResult> PreInvoiceGet(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.PreInvoiceListAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Pre")]
    public async Task<IActionResult> PreInvoicePost(PreInvoiceCreateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.PreInvoiceCreateAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("Pre/{id}")]
    public async Task<IActionResult> PreInvoicePut(int id, PreInvoiceUpdateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.PreInvoiceUpdateAsync(id, userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Pre/{id}")]
    public async Task<IActionResult> PreInvoiceDelete(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await invoiceService.PreInvoiceDeleteAsync(id, userId, cancellation);
        return Ok(result);
    }
}
