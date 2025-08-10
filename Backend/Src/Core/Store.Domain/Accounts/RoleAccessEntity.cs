using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts;
public class RoleAccessEntity
{
    public int RoleId { get; set; }
    public int AccessId { get; set; }
    public RoleEntity Role { get; set; }
}
