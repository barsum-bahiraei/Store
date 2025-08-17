using Microsoft.AspNetCore.Mvc;
using Store.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Store.Shared.Helpers;
public static class ControllerHelper
{
    public static List<ControllerActionListModel> GetControllerActionList()
    {
        Assembly apiAssembly = Assembly.Load("Store.Api");

        var controllers = apiAssembly
            .GetTypes()
            .Where(controller => controller.IsClass && controller.IsSubclassOf(typeof(ControllerBase)))
            .Select(controller => new ControllerActionListModel
            {
                ControllerName = controller.Name.Replace("Controller", ""),
                ControllerFullName = controller.FullName,
                ActionList = controller
                    .GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
                    .Where(method => method.IsPublic && !method.IsDefined(typeof(NonActionAttribute)))
                    .Select(method => method.Name)
                    .ToList()
            })
            .ToList();

        return controllers;
    }
}
