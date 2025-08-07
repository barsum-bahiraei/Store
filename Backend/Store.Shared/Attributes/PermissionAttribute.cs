using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Store.Service.Accounts;
using Store.Shared.Enums;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Store.Shared.Attributes;
public class PermissionAttribute(PermissionEnum permission) : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var email = context.HttpContext.User.FindFirst(x => x.Type == ClaimTypes.Email)?.Value;
        var userService = context.HttpContext.RequestServices.GetService<IAccountService>();

        var permissions = await userService.UserPermissionListAsync(email, context.HttpContext.RequestAborted);
        var hasPermission = permissions.Any(x => x.Id == (int)permission);

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
            return;
        }
    }
}
