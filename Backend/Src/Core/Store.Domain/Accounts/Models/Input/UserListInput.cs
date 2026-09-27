using Store.Domain.Accounts;

namespace Store.Domain.Accounts.Models.Input;

public class UserListInput
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? BirthDate { get; set; }
    public GenderTypeEnum? Gender { get; set; }
}
