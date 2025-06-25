using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Store.Service.Products;

namespace Client.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class ProductController(IProductService productService) : ControllerBase
{
    [HttpPost("List")]
    public async Task<ActionResult<List<ProductListOutput>>> ListAsync(ProductListInput parameters, CancellationToken cancellation)
    {
        var products = await productService.ListAsync(parameters, cancellation);
        return Ok(products);
    }
}
