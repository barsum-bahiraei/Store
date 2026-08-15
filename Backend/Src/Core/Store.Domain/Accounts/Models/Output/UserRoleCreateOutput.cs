namespace Store.Domain.Accounts.Models.Output;

public class UserRoleCreateOutput
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RoleId { get; set; }
}