namespace Store.Domain.Accounts;

public class UserEntity : BaseEntity
{
    public string Name { get; set; }
    public string Family { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public List<UserRoleEntity> UserRoles { get; set; }
}