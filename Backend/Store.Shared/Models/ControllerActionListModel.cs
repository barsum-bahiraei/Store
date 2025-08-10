using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Shared.Models;
public class ControllerActionListModel
{
    public string ControllerName { get; set; }
    public string ControllerFullName { get; set; }
    public List<string> ActionList { get; set; }
}
