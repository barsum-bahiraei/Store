namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<List<UserEntity>> UserListAsync(CancellationToken cancellation = default);
    Task<UserEntity?> UserGetAsync(string email, CancellationToken cancellation = default);
    Task<UserEntity?> UserGetAsync(int id, CancellationToken cancellation = default);
    Task<UserEntity> UserCreateAsync(UserEntity input, CancellationToken cancellation = default);
    Task<UserEntity> UserUpdateAsync(UserEntity input, CancellationToken cancellation = default);
    Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation = default);
    Task<RoleEntity?> RoleGetAsync(int id, CancellationToken cancellation = default);
    Task<RoleEntity> RoleCreateAsync(RoleEntity input, CancellationToken cancellation = default);
    Task<RoleEntity> RoleUpdateAsync(RoleEntity input, CancellationToken cancellation = default);
    Task RoleDeleteAsync(RoleEntity input, CancellationToken cancellation = default);
    Task<UserRoleEntity?> UserRoleGetAsync(int id, CancellationToken cancellation = default);
    Task<UserRoleEntity> UserRoleCreateAsync(UserRoleEntity input, CancellationToken cancellation = default);
    Task UserRoleDeleteAsync(UserRoleEntity input, CancellationToken cancellation = default);
    Task<List<RoleAccessEntity>> RoleAccessListAsync(CancellationToken cancellation = default);
    Task<List<RoleAccessEntity>> RoleAccessListAsync(int roleId,CancellationToken cancellation = default);
    Task<RoleAccessEntity?> RoleAccessGetAsync(int id, CancellationToken cancellation = default);
    Task<RoleAccessEntity> RoleAccessCreateAsync(RoleAccessEntity input, CancellationToken cancellation = default);
    Task RoleAccessDeleteAsync(RoleAccessEntity input, CancellationToken cancellation = default);
}