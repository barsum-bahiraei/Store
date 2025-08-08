using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts.Models.Output;
public class PermissionListOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? DisplayName { get; set; }
}
