using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts;
public class AccessEntity : BaseEntity
{
    public string Name { get; set; }
    public string ControllerName { get; set; }
    public List<RoleEntity> Roles { get; set; }
}
