using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Sellers.Models.Input;
using Store.Service.Sellers;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SellerController(SellerService sellerService) : ControllerBase
{
    [HasAccess]
    [HttpGet()]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.ListAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.GetAsync(id, userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(SellerCreateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.CreateAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SellerUpdateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.UpdateAsync(id, userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.DeleteAsync(id, userId, cancellation);
        return Ok(result);
    }
}