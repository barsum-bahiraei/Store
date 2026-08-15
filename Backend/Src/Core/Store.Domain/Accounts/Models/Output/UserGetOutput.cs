namespace Store.Domain.Accounts.Models.Output;

public class UserGetOutput
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? NationalCode { get; set; }
    public string? BirthDate { get; set; }
    public GenderTypeEnum Gender { get; set; }
    public string? Address { get; set; }
    public bool IsEmailVerified { get; set; }
    public List<UserRoleGetOutput> Roles { get; set; }
}

public class UserRoleGetOutput
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; }
    public List<UserRoleAccessGetOutput> Access { get; set; }
}

public class UserRoleAccessGetOutput
{
    public int Id { get; set; }
    public string ControllerName { get; set; }
    public string ActionName { get; set; }
}