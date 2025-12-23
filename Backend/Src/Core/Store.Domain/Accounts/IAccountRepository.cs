namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<UserEntity> DetailAsync(string email, CancellationToken cancellation);
    Task<UserEntity> CreateAsync(UserEntity input, CancellationToken cancellation);
    Task<RoleEntity> RoleCreateAsync(RoleEntity input, CancellationToken cancellation);
    Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation);
    Task<List<RoleAccessEntity>> UserRoleAccessListAsync(string email, CancellationToken cancellation);
    Task AccessListAssignRoleAsync(List<RoleAccessEntity> input, CancellationToken cancellation);
    Task RoleAssignUserAsync(UserRoleEntity input, CancellationToken cancellation);
    Task<bool> HasUserAsync(string email, CancellationToken cancellation);
}