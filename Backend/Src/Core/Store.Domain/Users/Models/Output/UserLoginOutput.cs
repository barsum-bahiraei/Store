namespace Store.Domain.Users.Models.Output;

public class UserLoginOutput
{
    public string Name { get; set; }
    public string Family { get; set; }
    public string Email { get; set; }
    public string Token { get; set; }
}