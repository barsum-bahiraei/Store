using Microsoft.AspNetCore.Mvc;
using Store.Domain.Products.Models.Input;
using Store.Service.Products;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController(ProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var result = await productService.ListAsync(cancellation);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var result = await productService.GetAsync(id, cancellation);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Post(ProductCreateInput input, CancellationToken cancellation = default)
    {
        var result = await productService.CreateAsync(input, cancellation);
        return Ok(result);
    }
    
    // PUT api/<ProductController>/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ProductUpdateInput input, CancellationToken cancellation = default)
    {
        var result = await productService.UpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await productService.DeleteAsync(id, cancellation);
        return Ok(result);
    }
}