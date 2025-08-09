using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts.Models.Input;
public class AccesssAssignRoleInput
{
    public int RoleId { get; set; }
    public List<int> AccessIds { get; set; }
}
