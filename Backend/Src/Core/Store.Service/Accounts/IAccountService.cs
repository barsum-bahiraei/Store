using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;

namespace Store.Service.Accounts;

public interface IAccountService
{
    Task<LoginOutput> LoginAsync(UserLoginInput parameters, CancellationToken cancellation);
    Task<string> CreateAsync(UserCreateInput parameters, CancellationToken cancellation);
    Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation);
    Task<RoleCreateOutput> RoleCreateAsync(UserRoleCreateInput parameters, CancellationToken cancellation);
    Task<List<RoleListOutput>> RoleListAsync(CancellationToken cancellation);
    Task PermissionCreateAsync(PermissionCreateInput parameters, CancellationToken cancellation);
    Task<List<PermissionListOutput>> PermissionListAsync(CancellationToken cancellation);
    Task<List<UserPermissionListOutput>> UserPermissionListAsync(string email, CancellationToken cancellation);
    Task PermissionsAssignRoleAsync(PermissionsAssignRoleInput parameters, CancellationToken cancellation);
    string GenerateToken(string email);
    string HashPassword(string password);
}