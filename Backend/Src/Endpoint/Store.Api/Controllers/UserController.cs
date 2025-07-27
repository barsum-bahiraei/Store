using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;
using Store.Service.Users;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController(IUserService userService) : Controller
{
    [HttpPost("Login")]
    public async Task<ActionResult<UserLoginOutput>> LoginAsync(UserLoginInput parameters,
        CancellationToken cancellation)
    {
        var user = await userService.LoginAsync(parameters, cancellation);
        return Ok(user);
    }

    [HttpPost("Register")]
    public async Task<ActionResult<string>> RegisterAsync(UserCreateInput parameters,
        CancellationToken cancellation)
    {
        var token = await userService.CreateAsync(parameters, cancellation);
        return Ok(token);
    }

    [Authorize(Roles = "User,Admin")]
    [HttpGet("Detail")]
    public async Task<ActionResult<UserDetailOutput>> DetailAsync(CancellationToken cancellation)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var user = await userService.DetailAsync(email, cancellation);
        return Ok(user);
    }
}