using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using System.Security.Claims;
using Store.Domain.Files;
using Store.Domain.Files.Models.Input;
using Store.Service.EntityService;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FileController(FileService fileService) : ControllerBase
{
    [HasAccess]
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var result = await fileService.GetAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] TableNameEnum tableName, [FromQuery] TargetNameEnum targetName, [FromQuery] int targetId, CancellationToken cancellation = default)
    {
        var result = await fileService.ListAsync(tableName, targetName, targetId, cancellation);

        return Ok(result);
    }

    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(IFormFile file, [FromForm] FileCreateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await fileService.CreateAsync(userId, input, file, cancellation);

        return Ok(result);
    }

    [HasAccess]
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, IFormFile file, [FromForm] FileUpdateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await fileService.UpdateAsync(id, userId, input, file, cancellation);

        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await fileService.DeleteAsync(id, userId, cancellation);
        return Ok(result);
    }
}