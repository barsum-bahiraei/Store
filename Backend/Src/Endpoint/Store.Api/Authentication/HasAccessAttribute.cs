using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Store.Api.Authentication;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class HasAccessAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // if (context.HttpContext.User.Identity?.IsAuthenticated == false)
        // {
        //     context.Result = new UnauthorizedResult();
        //     return;
        // }

        var email = context.HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
        var controllerName = context.ActionDescriptor.RouteValues["controller"];
        var actionName = context.ActionDescriptor.RouteValues["action"];

        await Task.CompletedTask;
    }
}