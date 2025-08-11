using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts.Models.Input;
public class AccessListAssignRoleInput
{
    public int RoleId { get; set; }
    public List<AccessList> ActionList { get; set; }
}

public class AccessList
{
    public string ActionName { get; set; }
    public string ControllerName { get; set; }
}
