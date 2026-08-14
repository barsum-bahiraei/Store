namespace Store.Domain.Accounts;

public class RoleEntity : BaseEntity
{
    public string Name { get; set; }
    public ICollection<UserRoleEntity> UserRoles { get; set; }
    public ICollection<RoleAccessEntity> RoleAccess { get; set; }
}