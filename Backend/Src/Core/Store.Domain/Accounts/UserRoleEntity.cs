namespace Store.Domain.Accounts;
public class UserRoleEntity : BaseEntity
{
    public int UserId { get; set; }
    public UserEntity User { get; set; }

    public int RoleId { get; set; }
    public RoleEntity Role { get; set; }
}
