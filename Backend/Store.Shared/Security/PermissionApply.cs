using Store.Service.Accounts;
using System.Reflection;

namespace Store.Shared.Security;
public class PermissionApply(IAccountService accountService)
{
    public async Task Apply()
    {
        var permissions = await accountService.PermissionListAsync();
    }
    public List<string> GetAllPermission()
    {
        var permissions = typeof(Permissions)
            .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
            .Where(fi => fi.IsLiteral && !fi.IsInitOnly && fi.FieldType == typeof(string))
            .Select(fi => (string)fi.GetRawConstantValue())
            .ToList();

        return permissions;
    }
}
