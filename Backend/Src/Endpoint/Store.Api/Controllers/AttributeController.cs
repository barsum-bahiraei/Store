using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Attribute.Models.Input;
using Store.Service.ProviderService;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AttributeController(AttributeService attributeService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var result = await attributeService.ListAsync(cancellation);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var result = await attributeService.GetAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(AttributeCreateInput input, CancellationToken cancellation = default)
    {
        var result = await attributeService.CreateAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, AttributeUpdateInput input, CancellationToken cancellation = default)
    {
        var result = await attributeService.UpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await attributeService.DeleteAsync(id, cancellation);
        return Ok(result);
    }
}