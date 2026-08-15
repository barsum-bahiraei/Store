using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Store.Service.Accounts;

namespace Store.Api.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class HasAccessAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (!context.HttpContext.User.Identity?.IsAuthenticated == true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userIdValue = context.HttpContext.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdValue, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var controllerName = context.ActionDescriptor.RouteValues["controller"];
        var actionName = context.ActionDescriptor.RouteValues["action"];

        if (string.IsNullOrWhiteSpace(controllerName) ||
            string.IsNullOrWhiteSpace(actionName))
        {
            context.Result = new ForbidResult();
            return;
        }

        var accountService = context.HttpContext.RequestServices
            .GetRequiredService<AccountService>();

        var result = await accountService.UserGetAsync(
            userId,
            context.HttpContext.RequestAborted);

        if (!result.IsSuccess || result.Data == null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var hasAccess = result.Data.Roles
            .SelectMany(role => role.Access)
            .Any(access =>
                access.ControllerName.Equals(
                    controllerName,
                    StringComparison.OrdinalIgnoreCase)
                &&
                access.ActionName.Equals(
                    actionName,
                    StringComparison.OrdinalIgnoreCase)
            );

        if (!hasAccess)
        {
            context.Result = new ForbidResult();
        }
    }
}