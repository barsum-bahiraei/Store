using Store.Domain.Accounts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Shared.Security;
public static class Permissions
{
    public const string UserDetail = "UserDetail";
    public const string RoleCreate = "RoleCreate";
    public const string PermissionsAssignRole = "PermissionsAssignRole";
    public const string RoleList = "RoleList";
}
