namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<List<UserEntity>> ListAsync(CancellationToken cancellation = default);
    Task<UserEntity?> GetAsync(int id, CancellationToken cancellation = default);
    Task<UserEntity> CreateAsync(UserEntity input, CancellationToken cancellation = default);
    Task<UserEntity> UpdateAsync(UserEntity input, CancellationToken cancellation = default);
    Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation = default);
    Task<RoleEntity?> RoleGetAsync(int id, CancellationToken cancellation = default);
    Task<RoleEntity> RoleCreateAsync(RoleEntity input, CancellationToken cancellation = default);
    Task<RoleEntity> RoleUpdateAsync(RoleEntity input, CancellationToken cancellation = default);
    Task RoleDeleteAsync(RoleEntity input, CancellationToken cancellation = default);
}