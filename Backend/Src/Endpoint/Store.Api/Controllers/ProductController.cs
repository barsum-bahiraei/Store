using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Microsoft.AspNetCore.Mvc;
using Store.Service.Products;

namespace Store.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class ProductController(IProductService productService) : ControllerBase
{
    [HttpPost("List")]
    public async Task<ActionResult<List<ProductListOutput>>> ListAsync(ProductListInput input, CancellationToken cancellation)
    {
        var products = await productService.ListAsync(input, cancellation);
        return Ok(products);
    }
}
