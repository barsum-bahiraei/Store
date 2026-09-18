using Store.Domain.Accounts;

namespace Store.Domain.Accounts.Models.Input;

public class UserListInput
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? BirthDate { get; set; }
    public GenderTypeEnum? Gender { get; set; }
}
