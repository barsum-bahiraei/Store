using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Products.Models.Input;
using Store.Service.ProviderService;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController(ProductService productService) : ControllerBase
{
    [HasAccess]
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.ListAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.GetAsync(id, userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(ProductCreateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.CreateAsync(userId, input, cancellation);
        return Ok(result);
    }

    // PUT api/<ProductController>/5
    [HasAccess]
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ProductUpdateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.UpdateAsync(id, userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.DeleteAsync(id, userId, cancellation);
        return Ok(result);
    }
}
