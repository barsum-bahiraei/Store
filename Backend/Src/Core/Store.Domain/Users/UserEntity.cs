namespace Store.Domain.Users;

public class UserEntity : BaseEntity
{
    public string Name { get; set; }
    public string Family { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public UserRoleEnum Role { get; set; }
}