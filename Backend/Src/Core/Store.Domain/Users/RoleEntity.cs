using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Users;
public class RoleEntity : BaseEntity
{
    public string Name { get; set; }
    public List<PermissionEntity> Permissions { get; set; }
    public List<UserEntity> Users { get; set; }
}
