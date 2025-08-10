using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;

namespace Store.Service.Accounts;

public interface IAccountService
{
    Task<LoginOutput> LoginAsync(UserLoginInput input, CancellationToken cancellation);
    Task<string> CreateAsync(UserCreateInput input, CancellationToken cancellation);
    Task<UserDetailOutput> DetailAsync(string email, CancellationToken cancellation);
    Task<RoleCreateOutput> RoleCreateAsync(UserRoleCreateInput input, CancellationToken cancellation);
    Task<List<RoleListOutput>> RoleListAsync(CancellationToken cancellation);
    Task<List<AccessListOutput>> UserRoleAccessListAsync(string email, CancellationToken cancellation);
    Task AccessListAsignRoleAsync(AccessListAssignRoleInput input, CancellationToken cancellation);
    Task RoleAssignUserAsync(RoleAssignUserInput input, CancellationToken cancellation);
    string GenerateToken(string email);
    string HashPassword(string password);
}