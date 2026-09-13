using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Service.EntityService;

namespace Store.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class InvoiceController(InvoiceService invoiceService) : ControllerBase
{
    [HasAccess]
    [HttpGet]
    public async Task<IActionResult> PreInvoiceGet(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = invoiceService.PreInvoiceListAsync(userId, cancellation);
        return Ok(result);
    }
}