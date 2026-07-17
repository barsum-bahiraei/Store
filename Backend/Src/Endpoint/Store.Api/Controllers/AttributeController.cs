using Microsoft.AspNetCore.Mvc;
using Store.Domain.Attribute.Models.Input;
using Store.Domain.Attribute.Models.Output;
using Store.Service.Attributes;

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

    [HttpPost]
    public async Task<IActionResult> Post(CreateAttributeInput input, CancellationToken cancellation = default)
    {
        var result = await attributeService.CreateAsync(input, cancellation);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, UpdateAttributeInput input, CancellationToken cancellation = default)
    {
        var result = await attributeService.UpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await attributeService.DeleteAsync(id, cancellation);
        return Ok(result);
    }
}