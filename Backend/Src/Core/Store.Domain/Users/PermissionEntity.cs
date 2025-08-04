using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Users;
public class PermissionEntity : BaseEntity
{
    public string Name { get; set; }
    public List<RoleEntity> Roles { get; set; }
}
