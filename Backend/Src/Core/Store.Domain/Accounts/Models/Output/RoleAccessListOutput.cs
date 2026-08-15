namespace Store.Domain.Accounts.Models.Output;

public class RoleAccessListOutput
{
    public int Id { get; set; }
    public string ControllerName { get; set; }
    public string ActionName { get; set; }
    public int RoleId { get; set; }
}