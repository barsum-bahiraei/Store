using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Store.Domain.Accounts.Models.Output;
using Store.Service;

namespace Store.Api.Authentication;

public class ControllerAccessProvider(IActionDescriptorCollectionProvider actionDescriptorCollectionProvider)
{
    public Result<List<ControllerActionListOutput>> ControllerActionList()
    {
        var items = actionDescriptorCollectionProvider.ActionDescriptors.Items
            .OfType<ControllerActionDescriptor>()
            .Where(x => x.MethodInfo.IsDefined(typeof(HasAccessAttribute), true));

        var result = items
            .GroupBy(x => x.ControllerName)
            .Select(x => new ControllerActionListOutput
            {
                ControllerName = x.Key,
                ActionsName = x
                    .Select(a => a.ActionName)
                    .Distinct()
                    .OrderBy(a => a)
                    .ToList()
            })
            .OrderBy(x => x.ControllerName)
            .ToList();

        return Result<List<ControllerActionListOutput>>.Success(result);
    }
}