using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Products.Models.Input;
using Store.Service.EntityService;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController(ProductService productService) : ControllerBase
{
    [HttpPost("/torob_api/v3/products")]
    public async Task<IActionResult> TorobProducts(ProductTorobInput input,
        CancellationToken cancellation = default)
    {
        var result = await productService.TorobListAsync(input, cancellation);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.ErrorMessage });
        return Ok(result.Data);
    }

    [HttpPost("Search")]
    public async Task<IActionResult> Search(ProductSearchInput input, CancellationToken cancellation = default)
    {
        var result = await productService.SearchAsync(input, cancellation);
        return Ok(result);
    }

    [HttpGet("Detail/{id}")]
    public async Task<IActionResult> Detail(int id, CancellationToken cancellation = default)
    {
        var result = await productService.DetailAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Comment/{productId}")]
    public async Task<IActionResult> CommentPost(int productId, ProductCommentCreateInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.CommentCreateAsync(productId, userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ProductListInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.ListAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.GetAsync(id, userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(ProductCreateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.CreateAsync(userId, input, cancellation);
        return Ok(result);
    }

    // PUT api/<ProductController>/5
    [HasAccess]
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ProductUpdateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.UpdateAsync(id, userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.DeleteAsync(id, userId, cancellation);
        return Ok(result);
    }

    [HttpGet("Brand")]
    public async Task<IActionResult> BrandGet(CancellationToken cancellation = default)
    {
        var result = await productService.BrandListAsync(cancellation);
        return Ok(result);
    }

    [HttpGet("Brand/{id}")]
    public async Task<IActionResult> BrandGet(int id, CancellationToken cancellation = default)
    {
        var result = await productService.BrandGetAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Brand")]
    public async Task<IActionResult> BrandPost(ProductBrandCreateInput input,
        CancellationToken cancellation = default)
    {
        var result = await productService.BrandCreateAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("Brand/{id}")]
    public async Task<IActionResult> BrandPut(int id, ProductBrandUpdateInput input,
        CancellationToken cancellation = default)
    {
        var result = await productService.BrandUpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Brand/{id}")]
    public async Task<IActionResult> BrandDelete(int id, CancellationToken cancellation = default)
    {
        var result = await productService.BrandDeleteAsync(id, cancellation);
        return Ok(result);
    }

    [HttpGet("Variant")]
    public async Task<IActionResult> VariantGet(CancellationToken cancellation = default)
    {
        var result = await productService.VariantListAsync(cancellation);
        return Ok(result);
    }

    [HttpGet("Variant/{id}")]
    public async Task<IActionResult> VariantGet(int id, CancellationToken cancellation = default)
    {
        var result = await productService.VariantGetAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Variant")]
    public async Task<IActionResult> VariantPost(ProductVariantCreateInput input,
        CancellationToken cancellation = default)
    {
        var result = await productService.VariantCreateAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("Variant/{id}")]
    public async Task<IActionResult> VariantPut(int id, ProductVariantUpdateInput input,
        CancellationToken cancellation = default)
    {
        var result = await productService.VariantUpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Variant/{id}")]
    public async Task<IActionResult> VariantDelete(int id, CancellationToken cancellation = default)
    {
        var result = await productService.VariantDeleteAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("Bookmark")]
    public async Task<IActionResult> BookmarkGet(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.BookmarkListAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Bookmark/{productId}")]
    public async Task<IActionResult> BookmarkPost(int productId, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.BookmarkCreateAsync(productId, userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Bookmark/{productId}")]
    public async Task<IActionResult> BookmarkDelete(int productId, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await productService.BookmarkDeleteAsync(productId, userId, cancellation);
        return Ok(result);
    }
}
