using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Accounts.Models.Output;
public class AccessListOutput
{
    public int Id { get; set; }
    public string AccessName { get; set; }
    public string? ControllerName { get; set; }
}
