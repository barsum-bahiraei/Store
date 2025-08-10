using Microsoft.AspNetCore.Mvc;
using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;
using Store.Service.Categories;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoryController(ICategoryService categoryService) : Controller
{
    [HttpPost("List")]
    public async Task<ActionResult<List<CategoryListOutput>>> ListAsync(CategoryListInput input, CancellationToken cancellation)
    {
        var categories = await categoryService.ListAsync(input, cancellation);
        return Ok(categories);
    }
}