namespace Store.Domain.Accounts;

public class RoleAccessEntity : BaseEntity
{
    public string Name { get; set; }
    public int RoleId { get; set; }
    public RoleEntity Role { get; set; }
}