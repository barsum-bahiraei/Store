using Microsoft.AspNetCore.Mvc;
using Store.Service.Categories;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoryController(CategoryService categoryService) : ControllerBase
{
    // GET: api/<ProductController>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var result = await categoryService.CategoryListAsync(cancellation);
        return Ok(result);
    }

    // GET api/<ProductController>/5
    [HttpGet("{id}")]
    public string Get(int id)
    {
        return "value";
    }

    // POST api/<ProductController>
    [HttpPost]
    public void Post([FromBody] string value)
    {
    }

    // PUT api/<ProductController>/5
    [HttpPut("{id}")]
    public void Put(int id, [FromBody] string value)
    {
    }

    // DELETE api/<ProductController>/5
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
    }
}
