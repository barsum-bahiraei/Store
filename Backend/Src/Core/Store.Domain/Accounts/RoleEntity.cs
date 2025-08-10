namespace Store.Domain.Accounts;
public class RoleEntity : BaseEntity
{
    public string Name { get; set; }
    public List<UserRoleEntity> UserRoles { get; set; }
    public List<RoleAccessEntity> RoleAccess { get; set; }
}
