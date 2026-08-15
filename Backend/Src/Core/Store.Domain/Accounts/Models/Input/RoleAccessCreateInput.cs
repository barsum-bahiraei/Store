namespace Store.Domain.Accounts.Models.Input;

public class RoleAccessCreateInput
{
    public string ControllerName { get; set; }
    public string ActionName { get; set; }
    public int RoleId { get; set; }
    
}