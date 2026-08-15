using Microsoft.AspNetCore.Mvc;
using Store.Domain.Accounts.Models.Input;
using Store.Service.Accounts;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController(AccountService accountService) : ControllerBase
{
    [HasAccess]
    [HttpGet("Role")]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var result = await accountService.RoleListAsync(cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("Role/{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleGetAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("Role")]
    public async Task<IActionResult> Post(RoleCreateInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleCreateAsync(input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPut("Role/{id}")]
    public async Task<IActionResult> Put(int id, RoleUpdateInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleUpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpDelete("Role/{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleDeleteAsync(id, cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpGet("RoleAccess")]
    public async Task<IActionResult> RoleAccessGet(CancellationToken cancellation = default)
    {
        var result = await accountService.RoleAccessListAsync(cancellation);
        return Ok(result);
    }

    [HasAccess]
    [HttpPost("RoleAccess")]
    public async Task<IActionResult> RoleAccessPost(RoleAccessCreateInput input,
        CancellationToken cancellation = default)
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
        var result = accountService.ControllerActionList();
        return Ok(result);
    }
}