namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<UserEntity> DetailAsync(string email, CancellationToken cancellation);
    Task<UserEntity> CreateAsync(UserEntity parameters, CancellationToken cancellation);
    Task<bool> HasUserAsync(string email, CancellationToken cancellation);
    Task<RoleEntity> RoleCreateAsync(RoleEntity parameters, CancellationToken cancellation);
    Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation);
    Task PermissionCreateAsync(PermissionEntity parameters, CancellationToken cancellation);
    Task<List<PermissionEntity>> PermissionListAsync(CancellationToken cancellation);
    Task<List<PermissionEntity>> UserPermissionListAsync(string email, CancellationToken cancellation);
    Task PermissionsAssignRoleAsync(int RoleId, List<int> parameters, CancellationToken cancellation);
}