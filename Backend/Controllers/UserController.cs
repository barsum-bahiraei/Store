using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreBackend.Data;
using StoreBackend.Helpers;
using StoreBackend.Models;
using StoreBackend.Services.Contracts;
using System.Security.Claims;

namespace StoreBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class UserController(DatabaseContext context, IConfiguration configuration, IUserService userService) : ControllerBase
{
    [HttpGet("Detail")]
    [Authorize]
    public async Task<IActionResult> Detail(CancellationToken cancellation)
    {
        var result = await userService.Detail(cancellation);
        return Ok(ResponseHelper.Success(result));
    }
}
