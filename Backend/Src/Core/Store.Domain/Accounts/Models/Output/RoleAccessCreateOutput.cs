namespace Store.Domain.Accounts.Models.Output;

public class RoleAccessCreateOutput
{
    public int Id { get; set; }
    public string ControllerName { get; set; }
    public string ActionName { get; set; }
    public int RoleId { get; set; }
}