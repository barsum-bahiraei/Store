using Microsoft.AspNetCore.Mvc;
using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;
using Store.Service.Categories;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoryController(ICategoryService categoryService) : Controller
{
    [HttpGet("List")]
    public async Task<ActionResult<List<CategoryListOutput>>> List(CancellationToken cancellation)
    {
        var result = await categoryService.ListAsync(cancellation);
        return Ok(result);
    }
    [HttpPost("Create")]
    public async Task<ActionResult<CategoryCreateOutput>> Create(CategoryCreateInput input,
        CancellationToken cancellationToken = default)
    {
        var result = await categoryService.CreateAsync(input, cancellationToken);
        return Ok(result);
    }
}