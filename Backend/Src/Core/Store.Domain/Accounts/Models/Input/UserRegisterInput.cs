namespace Store.Domain.Accounts.Models.Input;

public class UserRegisterInput
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public GenderTypeEnum Gender { get; set; }
    public string Password { get; set; }
}