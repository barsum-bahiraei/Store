namespace Store.Domain.Accounts;

public class RoleAccessEntity : BaseEntity
{
    public string ControllerName { get; set; }
    public string ActionName { get; set; }
    public int RoleId { get; set; }
    public RoleEntity Role { get; set; }
}