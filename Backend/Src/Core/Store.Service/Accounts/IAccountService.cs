using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;

namespace Store.Service.Accounts;

public interface IAccountService
{
    Task<UserLoginOutput> LoginAsync(UserLoginInput parameters, CancellationToken cancellation);
    Task<string> CreateAsync(UserCreateInput parameters, CancellationToken cancellation);
    Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation);
    Task<List<UserRoleListOutput>> RoleListAsync(string email, CancellationToken cancellation);
    Task<List<UserPermissionListOutput>> PermissionListAsync(string email, CancellationToken cancellation);
    Task<UserRoleCreateOutput> RoleCreateAsync(UserRoleCreateInput parameters, CancellationToken cancellation);
    string GenerateToken(string email);
    string HashPassword(string password);
}