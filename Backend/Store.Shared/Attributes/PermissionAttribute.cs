using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Store.Service.Accounts;
using Store.Shared.Enums;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Store.Shared.Attributes;
public class PermissionAttribute(PermissionEnum permission) : Attribute, IAuthorizationFilter
{
    public async void OnAuthorization(AuthorizationFilterContext context)
    {
        var email = context.HttpContext.User.FindFirst(x => x.Type == ClaimTypes.Email)?.Value;
        var userService = context.HttpContext.RequestServices.GetService<IAccountService>();

        var user = await userService.DetailAsync(email, context.HttpContext.RequestAborted);
    }
}
