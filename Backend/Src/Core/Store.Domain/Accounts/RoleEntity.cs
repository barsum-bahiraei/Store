namespace Store.Domain.Accounts;
public class RoleEntity : BaseEntity
{
    public string Name { get; set; }
    public string? DisplayName { get; set; }
    public List<PermissionEntity> Permissions { get; set; }
    public List<UserEntity> Users { get; set; }
}
