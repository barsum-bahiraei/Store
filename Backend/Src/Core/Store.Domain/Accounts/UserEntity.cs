namespace Store.Domain.Accounts;

public class UserEntity : BaseEntity
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? NationalCode { get; set; }
    public string? BirthDate { get; set; }
    public GenderTypeEnum Gender { get; set; }
    public string PasswordHash { get; set; }
    public string? Address { get; set; }
    public bool IsEmailVerified { get; set; }
    public ICollection<UserRoleEntity> UserRoles { get; set; }
}