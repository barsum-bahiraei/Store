using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Sellers.Models.Input;
using Store.Service.EntityService;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SellerController(SellerService sellerService) : ControllerBase
{
    [HasAccess]
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.ListAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.GetAsync(id, userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost]
    public async Task<IActionResult> Post(SellerCreateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.CreateAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SellerUpdateInput input, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.UpdateAsync(id, userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.DeleteAsync(id, userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("Dashboard")]
    public async Task<IActionResult> DashboardGet([FromQuery] SellerDashboardInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.DashboardAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("SalesChart")]
    public async Task<IActionResult> SalesChartGet([FromQuery] SellerSalesChartInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.SalesChartAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("TopProducts")]
    public async Task<IActionResult> TopProductsGet([FromQuery] SellerTopProductsInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.TopProductsAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("TopVariants")]
    public async Task<IActionResult> TopVariantsGet([FromQuery] SellerTopVariantsInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.TopVariantsAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("OrderStatuses")]
    public async Task<IActionResult> OrderStatusesGet([FromQuery] SellerOrderStatusesInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.OrderStatusesAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("LowStock")]
    public async Task<IActionResult> LowStockGet([FromQuery] SellerLowStockInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.LowStockAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("ProductsWithoutSales")]
    public async Task<IActionResult> ProductsWithoutSalesGet([FromQuery] SellerProductsWithoutSalesInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.ProductsWithoutSalesAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("CategorySales")]
    public async Task<IActionResult> CategorySalesGet([FromQuery] SellerCategorySalesInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.CategorySalesAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("DiscountStatistics")]
    public async Task<IActionResult> DiscountStatisticsGet([FromQuery] SellerDiscountStatisticsInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.DiscountStatisticsAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("Orders/Attention")]
    public async Task<IActionResult> OrdersAttentionGet([FromQuery] SellerOrdersAttentionInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.OrdersAttentionAsync(userId, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("Order/{id}/Status")]
    public async Task<IActionResult> OrderStatusPut(int id, SellerOrderStatusUpdateInput input,
        CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await sellerService.OrderStatusUpdateAsync(id, userId, input, cancellation);
        return Ok(result);
    }
}