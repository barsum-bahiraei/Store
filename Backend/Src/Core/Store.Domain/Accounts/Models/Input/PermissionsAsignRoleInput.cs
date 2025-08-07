using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts.Models.Input;
public class PermissionsAssignRoleInput
{
    public int RoleId { get; set; }
    public List<int> PermissionIds { get; set; }
}
