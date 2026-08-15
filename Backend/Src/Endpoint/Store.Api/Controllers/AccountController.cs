using Microsoft.AspNetCore.Mvc;
using Store.Domain.Accounts.Models.Input;
using Store.Service.Accounts;

namespace Store.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController(AccountService accountService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellation = default)
    {
        var result = await accountService.RoleListAsync(cancellation);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleGetAsync(id, cancellation);
        return Ok(result);
    }

    [HttpPost("Role")]
    public async Task<IActionResult> Post(RoleCreateInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleCreateAsync(input, cancellation);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, RoleUpdateInput input, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleUpdateAsync(id, input, cancellation);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellation = default)
    {
        var result = await accountService.RoleDeleteAsync(id, cancellation);
        return Ok(result);
    }
}