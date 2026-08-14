using Microsoft.AspNetCore.Mvc;
using Store.Domain.Files.Models.Input;
using Store.Service.Files;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FileController(FileService fileService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Post(IFormFile file, [FromForm] FileCreateInput input,
        CancellationToken cancellation = default)
    {
        var result = await fileService.CreateAsync(input, file, cancellation);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await fileService.DeleteAsync(id, cancellation);
        return Ok(result);
    }
}