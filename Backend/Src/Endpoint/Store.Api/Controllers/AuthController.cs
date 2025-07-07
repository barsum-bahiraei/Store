using Microsoft.AspNetCore.Mvc;
using Store.Domain.Users.Models.Input;
using Store.Domain.Users.Models.Output;
using Store.Service.Users;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IUserService userService) : Controller
{
    [HttpPost]
    public async Task<ActionResult<UserCreateOutput>> CreateAsync(UserCreateInput parameters, CancellationToken cancellation)
    {
        var user = await userService.CreateAsync(parameters, cancellation);
        return Ok(user);
    }
}