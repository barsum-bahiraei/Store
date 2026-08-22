using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Files.Models.Input;
using Store.Service.ProviderService;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FileController(FileService fileService) : ControllerBase
{
    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(IFormFile file, [FromForm] FileCreateInput input,
        CancellationToken cancellation = default)
    {
        var result = await fileService.CreateAsync(input, file, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await fileService.DeleteAsync(id, cancellation);
        return Ok(result);
    }
}