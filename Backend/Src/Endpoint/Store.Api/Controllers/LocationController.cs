using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Store.Service.EntityService;

namespace Store.Api.Controllers;

[AllowAnonymous]
[Route("api/[controller]")]
[ApiController]
public class LocationController(LocationService locationService) : ControllerBase
{
    [HttpGet("Province")]
    public async Task<IActionResult> ProvinceGet(CancellationToken cancellation = default)
    {
        var result = await locationService.ProvinceListAsync(cancellation);
        return Ok(result);
    }

    [HttpGet("Province/{provinceId:int}/City")]
    public async Task<IActionResult> CityGet(int provinceId, CancellationToken cancellation = default)
    {
        var result = await locationService.CityListAsync(provinceId, cancellation);
        return Ok(result);
    }
}
