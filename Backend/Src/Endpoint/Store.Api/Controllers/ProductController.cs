using Microsoft.AspNetCore.Mvc;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    [HttpGet]
    public void Get(CancellationToken cancellation = default)
    {
        // var result = await categoryService.ListAsync(cancellation);
        // return Ok(result);
    }
}