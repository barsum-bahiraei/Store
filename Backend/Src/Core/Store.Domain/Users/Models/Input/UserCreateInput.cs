namespace Store.Domain.Users.Models.Input;

public class UserCreateInput
{
    public string Name { get; set; }
    public string Family { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}