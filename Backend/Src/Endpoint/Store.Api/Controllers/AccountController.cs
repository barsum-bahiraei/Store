using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;
using Store.Service.Accounts;
using Store.Shared.Attributes;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController(IAccountService userService) : Controller
{
    [HttpPost("Login")]
    public async Task<ActionResult<LoginOutput>> Login(UserLoginInput parameters, CancellationToken cancellation = default)
    {
        var user = await userService.LoginAsync(parameters, cancellation);
        return Ok(user);
    }

    [HttpPost("Register")]
    public async Task<ActionResult<string>> Register(UserCreateInput parameters, CancellationToken cancellation = default)
    {
        var token = await userService.CreateAsync(parameters, cancellation);
        return Ok(token);
    }

    [Security]
    [HttpGet("Detail")]
    public async Task<ActionResult<UserDetailOutput>> Detail(CancellationToken cancellation = default)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var user = await userService.DetailAsync(email, cancellation);
        return Ok(user);
    }

    [Security]
    [HttpPost("RoleList")]
    public async Task<ActionResult<RoleCreateOutput>> RoleCreate(CancellationToken cancellation = default)
    {
        var roles = await userService.RoleListAsync(cancellation);
        return Ok(roles);
    }

    [Security]
    [HttpPost("RoleCreate")]
    public async Task<ActionResult<RoleCreateOutput>> RoleCreate(UserRoleCreateInput parameters, CancellationToken cancellation = default)
    {
        var role = await userService.RoleCreateAsync(parameters, cancellation);
        return Ok(role);
    }
}