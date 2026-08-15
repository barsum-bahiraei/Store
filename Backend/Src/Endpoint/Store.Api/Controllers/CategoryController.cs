using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Categories.Models.Input;
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
        var result = await categoryService.ListAsync(cancellation);
        return Ok(result);
    }

    // GET api/<ProductController>/5
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var result = await categoryService.GetAsync(id, cancellation);
        return Ok(result);
    }

    // POST api/<ProductController>
    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(CategoryCreateInput input, CancellationToken cancellation = default)
    {
        var result = await categoryService.CreateAsync(input, cancellation);
        return Ok(result);
    }

    // PUT api/<ProductController>/5
    [HasAccess]
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, CategoryUpdateInput input, CancellationToken cancellation = default)
    {
        var result = await categoryService.UpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    // DELETE api/<ProductController>/5
    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await categoryService.DeleteAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("Attribute/{categoryid}")]
    public async Task<IActionResult> AttributeGet(int categoryid, CancellationToken cancellation = default)
    {
        var result = await categoryService.AttributeListAsync(categoryid, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Attribute")]
    public async Task<IActionResult> AttributePost(CategoryAttributeAddInput input, CancellationToken cancellation = default)
    {
        var result = await categoryService.AttributeAddAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Attribute/{id}")]
    public async Task<IActionResult> AttributeDelete(int id, CancellationToken cancellation = default)
    {
        var result = await categoryService.AttributeDeleteAsync(id, cancellation);
        return Ok(result);
    } 
}