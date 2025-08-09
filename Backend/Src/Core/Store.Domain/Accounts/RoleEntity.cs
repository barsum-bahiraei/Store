namespace Store.Domain.Accounts;
public class RoleEntity : BaseEntity
{
    public string Name { get; set; }
    public List<AccessEntity> Access { get; set; }
    public List<UserEntity> Users { get; set; }
}
