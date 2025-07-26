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
    public async Task<ActionResult<string>> LoginAsync(UserCreateInput parameters,
        CancellationToken cancellation)
    {
        var user = await userService.CreateAsync(parameters, cancellation);
        return Ok(user);
    }

    [HttpPost("Register")]
    public async Task<ActionResult<string>> RegisterAsync(UserCreateInput parameters,
        CancellationToken cancellation)
    {
        var token = await userService.CreateAsync(parameters, cancellation);
        return Ok(token);
    }
}