using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;
using Store.Service.Accounts;
using Store.Shared.Attributes;
using Store.Shared.Helpers;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController(IAccountService userService) : Controller
{
    [HttpPost("Login")]
    public async Task<ActionResult<LoginOutput>> Login(UserLoginInput input, CancellationToken cancellation = default)
    {
        var user = await userService.LoginAsync(input, cancellation);
        return Ok(user);
    }

    [HttpPost("Register")]
    public async Task<ActionResult<string>> Register(UserCreateInput input, CancellationToken cancellation = default)
    {
        var token = await userService.CreateAsync(input, cancellation);
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
    public async Task<ActionResult<RoleCreateOutput>> RoleCreate(UserRoleCreateInput input, CancellationToken cancellation = default)
    {
        var role = await userService.RoleCreateAsync(input, cancellation);
        return Ok(role);
    }

    [Security]
    [HttpPost("AccessListAssignRole")]
    public async Task<ActionResult> AccessListAssignRole(AccessListAssignRoleInput input, CancellationToken cancellation = default)
    {
        await userService.AccessListAssignRoleAsync(input, cancellation);
        return Ok();
    }

    [Security]
    [HttpPost("RoleAssignUser")]
    public async Task<ActionResult> RoleAssignUser(RoleAssignUserInput input, CancellationToken cancellation = default)
    {
        await userService.RoleAssignUserAsync(input, cancellation);
        return Ok();
    }

    [Security]
    [HttpGet("ControllerActionList")]
    public ActionResult ControllerActionList()
    {
        var output = ControllerHelper.GetControllerActionList();
        return Ok(output);
    }
}