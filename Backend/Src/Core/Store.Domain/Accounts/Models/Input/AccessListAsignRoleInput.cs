using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts.Models.Input;
public class AccessListAssignRoleInput
{
    public int RoleId { get; set; }
    public List<AccessList> AccessList { get; set; }
}

public class AccessList
{
    public string AccessName { get; set; }
    public string ControllerName { get; set; }
}
