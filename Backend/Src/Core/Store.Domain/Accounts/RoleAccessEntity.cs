using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts;
public class RoleAccessEntity : BaseEntity
{
    public string AccessName { get; set; }
    public string ControllerName { get; set; }
    public int RoleId { get; set; }
    public RoleEntity Role { get; set; }
}
