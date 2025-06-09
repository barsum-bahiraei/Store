using Microsoft.AspNetCore.Mvc;
using StoreBackend.Helpers;
using StoreBackend.Models;
using StoreBackend.Services.Contracts;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace StoreBackend.Controllers;
[Route("api/[controller]")]
[ApiController]
public class ProductController(IProductService productService) : ControllerBase
{
    // GET: api/<ValuesController>
    [HttpGet("{id}")]
    public async Task<IActionResult> Get([FromRoute] int id, CancellationToken cancellation)
    {
        var result = await productService.Detail(id, cancellation);
        return Ok(ResponseHelper.Success(result));
    }

    // POST api/<ValuesController>
    [HttpPost("Create")]
    public async Task<IActionResult> Create([FromBody] ProductCreateParameters parameters, CancellationToken cancellation)
    {
        var productId = await productService.Create(parameters, cancellation);
        return Ok(ResponseHelper.Success(productId));
    }

    [HttpPost("List")]
    public async Task<IActionResult> List(ProductListParameters parameters, CancellationToken cancellation)
    {
        var result = await productService.List(parameters, cancellation);
        return Ok(ResponseHelper.Success(result));
    }

    // PUT api/<ValuesController>/5
    [HttpPut("{id}")]
    public void Put(int id, [FromBody] string value)
    {
    }

    // DELETE api/<ValuesController>/5
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
    }
}
