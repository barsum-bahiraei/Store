namespace Store.Domain.Users.Models.Output;

public class UserDetailOutput
{
    public string Name { get; set; }
    public string Family { get; set; }
    public string Email { get; set; }
    public UserRoleEnum Role { get; set; }
}