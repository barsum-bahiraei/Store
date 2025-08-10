using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts.Models.Output;
public class ControllerActionListOutput
{
    public string ControllerName { get; set; }
    public List<string> ActionList { get; set; }
}
