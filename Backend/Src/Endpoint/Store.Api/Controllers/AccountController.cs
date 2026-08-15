using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Store.Api.Authorization;
using Store.Domain.Accounts.Models.Input;
using Store.Service.Accounts;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController(AccountService accountService, ControllerAccessProvider controllerAccessProvider)
    : ControllerBase
{
    [HasAccess]
    [HttpGet("User")]
    public async Task<IActionResult> UserGet(CancellationToken cancellation = default)
    {
        var result = await accountService.UserListAsync(cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("User/{id}")]
    public async Task<IActionResult> UserGet(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.UserGetAsync(id, cancellation);
        return Ok(result);
    }

    [HttpPost("UserRegister")]
    public async Task<IActionResult> UserRegisterPost(UserRegisterInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.UserRegisterAsync(input, cancellation);
        return Ok(result);
    }

    [HttpPost("UserLogin")]
    public async Task<IActionResult> UserLoginPost(UserLoginInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.UserLoginAsync(input, cancellation);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("UserProfile")]
    public async Task<IActionResult> UserProfileGet(CancellationToken cancellation = default)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await accountService.UserProfileGetAsync(userId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("Role")]
    public async Task<IActionResult> RoleGet(CancellationToken cancellation = default)
    {
        var result = await accountService.RoleListAsync(cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Role")]
    public async Task<IActionResult> RolePost(RoleCreateInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleCreateAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("Role/{id}")]
    public async Task<IActionResult> RolePut(int id, RoleUpdateInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleUpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Role/{id}")]
    public async Task<IActionResult> RoleDelete(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleDeleteAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("UserRole")]
    public async Task<IActionResult> UserRolePost(UserRoleCreateInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.UserRoleCreateAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("UserRole/{id}")]
    public async Task<IActionResult> UserRoleDelete(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.UserRoleDeleteAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("RoleAccess/{roleId}")]
    public async Task<IActionResult> RoleAccessGet(int roleId, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleAccessListAsync(roleId, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("RoleAccess")]
    public async Task<IActionResult> RoleAccessPost(
        RoleAccessCreateInput input,
        CancellationToken cancellation = default
    )
    {
        var result = await accountService.RoleAccessCreateAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("RoleAccess/{id}")]
    public async Task<IActionResult> RoleAccessDelete(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleAccessDeleteAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("ControllerActions")]
    public IActionResult ControllerActionsGet()
    {
        var result = controllerAccessProvider.ControllerActionList();
        return Ok(result);
    }
}